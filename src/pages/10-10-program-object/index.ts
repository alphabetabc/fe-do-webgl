import { GLHelper } from "@utils";
import { createCubeBufferObject } from "./creator";
import SolidVertexSource from "./solid-vertex.vert?raw";
import SolidFragmentSource from "./solid-fragment.frag?raw";
import TextureVertexSource from "./texture-vertex.vert?raw";
import TextureFragmentSource from "./texture-fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const solidProgramObject = ctx.createShaderProgram(
    {
        attributes: {
            a_Position: {},
            a_Normal: {},
        },
        uniforms: {
            u_MvpMatrix: {},
            u_NormalMatrix: {},
        },
        vertexShader: SolidVertexSource,
        fragmentShader: SolidFragmentSource,
    },
    false,
);

const textureProgramObject = ctx.createShaderProgram(
    {
        attributes: {
            a_Position: {},
            a_Normal: {},
            a_TexCoord: {},
        },
        uniforms: {
            u_MvpMatrix: {},
            u_NormalMatrix: {},
            u_Texture: {}, // 纹理采样器
        },
        vertexShader: TextureVertexSource,
        fragmentShader: TextureFragmentSource,
    },
    false,
);

const bufferObject = createCubeBufferObject(ctx);

const viewProjMatrix = new GLHelper.Math.Matrix4();
viewProjMatrix.setPerspective(30, ctx.width / ctx.height, 1, 100);
viewProjMatrix.lookAt(
    //
    GLHelper.Math.Vector3.create([0, 0, 15]),
    GLHelper.Math.Vector3.create([0, 0, 0]),
    GLHelper.Math.Vector3.create([0, 1, 0]),
);

const modelMatrix = new GLHelper.Math.Matrix4();
const mvpMatrix = new GLHelper.Math.Matrix4();
const normalMatrix = new GLHelper.Math.Matrix4();

const draw = (options: { offsetX: number; rotateAngle: number; programObject: typeof solidProgramObject | typeof textureProgramObject }) => {
    modelMatrix.setTranslate(options.offsetX, 0.0, 0.0);
    modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
    modelMatrix.rotate(options.rotateAngle, 0.0, 1.0, 0.0);

    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    ctx.uniformMatrix4fv(options.programObject.shader.getUniformLocation("u_NormalMatrix"), normalMatrix);

    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(options.programObject.shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    ctx.gl.drawElements(ctx.gl.TRIANGLES, bufferObject.indicesLength, bufferObject.indexBufferType, 0);
};

GLHelper.Hooks.Render.addEventListener((state) => {
    ctx.clear();
    // draw solid
    ctx.useProgram(solidProgramObject.program);
    bufferObject.useVertexBuffer(solidProgramObject.shader.getAttributeLocation("a_Position"));
    bufferObject.useNormalBuffer(solidProgramObject.shader.getAttributeLocation("a_Normal"));
    bufferObject.useIndicesBuffer();
    draw({ offsetX: -2, rotateAngle: state.rotateAngle, programObject: solidProgramObject });

    // draw texture
    ctx.useProgram(textureProgramObject.program);
    bufferObject.useVertexBuffer(textureProgramObject.shader.getAttributeLocation("a_Position"));
    bufferObject.useNormalBuffer(textureProgramObject.shader.getAttributeLocation("a_Normal"));
    bufferObject.useTexCoordBuffer(textureProgramObject.shader.getAttributeLocation("a_TexCoord"));
    bufferObject.useIndicesBuffer();
    draw({ offsetX: 2, rotateAngle: state.rotateAngle, programObject: textureProgramObject });
});

let rotateAngle = 0;

GLHelper.Hooks.Update.addEventListener(() => {
    rotateAngle += 1;
    if (rotateAngle > 360) {
        rotateAngle = 0;
    }
    GLHelper.Hooks.Render.emit({ rotateAngle });
});
GLHelper.Hooks.Update.pause();

await ctx.loadTexture(textureProgramObject.shader.getUniformLocation("u_Texture"), { url: "/assets/sky.jpg" });
GLHelper.Hooks.Update.resume();
