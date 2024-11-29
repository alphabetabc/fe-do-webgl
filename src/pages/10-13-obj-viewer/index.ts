import { GLHelper } from "@utils";
import { ObjModelLoader } from "./ObjLoader/ObjLoader";
import fragmentSource from "./fragment.frag?raw";
import vertexSource from "./vertex.vert?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
        a_Normal: {},
    },
    uniforms: {
        u_MvpMatrix: {},
        u_NormalMatrix: {},
    },
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
});

const modelObj = new ObjModelLoader("/model/cube-1.obj", { scale: 30, reverse: true });

/**
 * 创建空的buffer对象集合
 */
const modelBuffer = {
    vertexBuffer: ctx.createLocationEmptyBufferObject(shader.getAttributeLocation("a_Position"), {
        target: ctx.gl.ARRAY_BUFFER,
        size: 3,
        type: ctx.gl.FLOAT,
    }),
    normalBuffer: ctx.createLocationEmptyBufferObject(shader.getAttributeLocation("a_Normal"), {
        target: ctx.gl.ARRAY_BUFFER,
        size: 3,
        type: ctx.gl.FLOAT,
    }),
    colorBuffer: ctx.createLocationEmptyBufferObject(shader.getAttributeLocation("a_Color"), {
        target: ctx.gl.ARRAY_BUFFER,
        size: 4,
        type: ctx.gl.FLOAT,
    }),
    indexBuffer: new GLHelper.WebGLBufferObject(ctx, {
        target: ctx.gl.ELEMENT_ARRAY_BUFFER,
    }),
};

ctx.unBindArrayBuffer();
ctx.unBindElementArrayBuffer();

const viewProjMatrix = GLHelper.Math.Matrix4.create();
viewProjMatrix.setPerspective(30.0, ctx.width / ctx.height, 1.0, 5000);
viewProjMatrix.lookAt(
    //
    GLHelper.Math.Vector3.create([0, 500, 200]),
    GLHelper.Math.Vector3.create([0, 0, 0]),
    GLHelper.Math.Vector3.create([0, 1, 0]),
);

const modelMatrix = GLHelper.Math.Matrix4.create();
const mvpMatrix = GLHelper.Math.Matrix4.create();
const normalMatrix = GLHelper.Math.Matrix4.create();

const state = {
    angle: 0,
};

GLHelper.Hooks.Render.addEventListener(() => {
    if (!modelObj.isMTLComplete()) {
        return;
    }

    // 获取渲染数据
    const drawingInfo = modelObj.getDrawingInfo();
    modelBuffer.vertexBuffer.bufferData(drawingInfo.vertices, ctx.gl.STATIC_DRAW);
    modelBuffer.normalBuffer.bufferData(drawingInfo.normals, ctx.gl.STATIC_DRAW);
    modelBuffer.colorBuffer.bufferData(drawingInfo.colors, ctx.gl.STATIC_DRAW);
    modelBuffer.indexBuffer.bufferData(drawingInfo.indices, ctx.gl.STATIC_DRAW);

    ctx.clear();
    modelMatrix.setRotate(state.angle, 1, 0, 0);
    modelMatrix.rotate(state.angle, 0, 1, 0);
    modelMatrix.rotate(state.angle, 0, 0, 1);

    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    ctx.uniformMatrix4fv(shader.getUniformLocation("u_NormalMatrix"), normalMatrix);

    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    ctx.gl.drawElements(ctx.gl.TRIANGLES, drawingInfo.indices.length, ctx.gl.UNSIGNED_SHORT, 0);
});

GLHelper.Hooks.Update.addEventListener(() => {
    state.angle += 0.5;
    state.angle = state.angle % 360;
    GLHelper.Hooks.Render.emit();
});
