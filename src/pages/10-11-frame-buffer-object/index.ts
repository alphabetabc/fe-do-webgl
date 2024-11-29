import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { dataSource } from "./data";

const options = {
    offscreenWidth: 256,
    offscreenHeight: 256,
};

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    attributes: {
        a_Position: {},
        a_TexCoord: {},
    },
    uniforms: {
        u_MvpMatrix: {},
        u_Sampler: {},
    },
});

const cubeBufferObject = {
    useVertexBuffer: ctx
        .createArrayBufferObject(dataSource.cube.vertices)
        .createUseBufferExecutor(shader.getAttributeLocation("a_Position"), { size: 3 }),
    useTexCoordBuffer: ctx
        .createArrayBufferObject(dataSource.cube.texCoords)
        .createUseBufferExecutor(shader.getAttributeLocation("a_TexCoord"), { size: 2 }),
    useIndexBuffer: ctx.createElementArrayBufferObject(dataSource.cube.indices).createUseBufferExecutor(),
    indexLength: dataSource.cube.indices.length,
    indexBufferType: ctx.gl.UNSIGNED_BYTE,
};

const planeBufferObject = {
    useVertexBuffer: ctx
        .createArrayBufferObject(dataSource.plane.vertices)
        .createUseBufferExecutor(shader.getAttributeLocation("a_Position"), { size: 3 }),
    useTexCoordBuffer: ctx
        .createArrayBufferObject(dataSource.plane.texCoords)
        .createUseBufferExecutor(shader.getAttributeLocation("a_TexCoord"), { size: 2 }),
    useIndexBuffer: ctx.createElementArrayBufferObject(dataSource.plane.indices).createUseBufferExecutor(),
    indexLength: dataSource.plane.indices.length,
    indexBufferType: ctx.gl.UNSIGNED_BYTE,
};

ctx.unBindArrayBuffer();
ctx.unBindElementArrayBuffer();

const framebufferObject = ctx.createFramebufferObject({
    width: options.offscreenWidth,
    height: options.offscreenHeight,
});

const modelMatrix = new GLHelper.Math.Matrix4();
const viewProjMatrix = new GLHelper.Math.Matrix4();
const viewProjMatrixFBO = new GLHelper.Math.Matrix4();
const mvpMatrix = new GLHelper.Math.Matrix4();

viewProjMatrix.setPerspective(30.0, ctx.width / ctx.height, 1.0, 100.0);
viewProjMatrix.lookAt(
    //
    GLHelper.Math.Vector3.create([0, 0, 7]),
    GLHelper.Math.Vector3.create([0, 0, 0]),
    GLHelper.Math.Vector3.create([0, 1.0, 0]),
);

viewProjMatrixFBO.setPerspective(30.0, options.offscreenWidth / options.offscreenHeight, 1.0, 100.0);
viewProjMatrixFBO.lookAt(
    //
    GLHelper.Math.Vector3.create([0, 0.0, 8]),
    GLHelper.Math.Vector3.create([0, 0, 0]),
    GLHelper.Math.Vector3.create([0, 1.0, 0]),
);

const state = {
    angle: 0,
};

const textureObject = ctx.createTextureObject({
    location: shader.getUniformLocation("u_Sampler"),
    url: "/assets/sky.jpg",
});

const drawObject = (entityObject: typeof cubeBufferObject | typeof planeBufferObject, texture: WebGLTexture) => {
    entityObject.useVertexBuffer();
    entityObject.useTexCoordBuffer();
    entityObject.useIndexBuffer();

    ctx.gl.activeTexture(ctx.gl.TEXTURE0);
    ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, texture);

    ctx.gl.drawElements(ctx.gl.TRIANGLES, entityObject.indexLength, entityObject.indexBufferType, 0);
};

GLHelper.Hooks.Render.addEventListener(() => {
    const rotateY = state.angle;

    // 绘制纹理立方体
    framebufferObject.bindFramebuffer(); // 绑定 frameBuffer
    ctx.gl.viewport(0, 0, options.offscreenWidth, options.offscreenHeight);
    ctx.clear({ r: 0, g: 0, b: 1, a: 1.0 });

    modelMatrix.setRotate(20.0, 1, 0, 0);
    modelMatrix.rotate(rotateY, 0, 1, 0);
    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    drawObject(cubeBufferObject, textureObject.texture);

    // 绘制纹理平面
    framebufferObject.unbindFramebuffer(); // 解绑 frameBuffer
    ctx.gl.viewport(0, 0, ctx.width, ctx.height);
    ctx.clear();
    modelMatrix.setTranslate(0, 0, 1);
    modelMatrix.rotate(20, 1.0, 0, 0);
    modelMatrix.rotate(rotateY, 0, 1, 0);
    mvpMatrix.set(viewProjMatrixFBO);
    mvpMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    drawObject(planeBufferObject, framebufferObject.texture);
});

GLHelper.Hooks.Update.addEventListener(() => {
    state.angle += 0.5;
    if (state.angle > 360) {
        state.angle = 0;
    }

    GLHelper.Hooks.Render.emit();
});

GLHelper.Hooks.Update.pause();
await textureObject.ready;
GLHelper.Hooks.Update.resume();
