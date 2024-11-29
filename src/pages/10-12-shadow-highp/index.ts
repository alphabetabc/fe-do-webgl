/**
 * state.lightY = 50 的时候就看不到阴影了
 */

import { GLHelper } from "@utils";
import { shaderSource } from "./shader";
import { data } from "./data";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const state = {
    offscreenWidth: 2048,
    offscreenHeight: 2048,
    lightX: 0,
    lightY: 40,
    lightZ: 2,
    currentAngle: 0,
};

// 阴影着色器
const shadowProgramObject = ctx.createShaderProgram(
    {
        attributes: {
            a_Position: {},
        },
        uniforms: {
            u_MvpMatrix: {},
        },
        vertexShader: shaderSource.shadow.vertexSource,
        fragmentShader: shaderSource.shadow.fragmentSource,
    },
    false,
);

// 根据上一个着色器计算出的距离绘制场景
const normalProgramObject = ctx.createShaderProgram(
    {
        attributes: {
            a_Position: {},
            a_Color: {},
        },
        uniforms: {
            u_MvpMatrix: {},
            u_MvpMatrixFromLight: {},
            u_ShadowMap: {},
        },
        vertexShader: shaderSource.normal.vertexSource,
        fragmentShader: shaderSource.normal.fragmentSource,
    },
    false,
);

const triangleObject = {
    useVertexBuffer: ctx.createArrayBufferObject(data.triangle.vertices).useBuffer,
    useColorBuffer: ctx.createArrayBufferObject(data.triangle.colors).useBuffer,
    useIndexBuffer: ctx.createElementArrayBufferObject(data.triangle.indices).useBuffer,
    indexLength: data.triangle.indices.length,
};

const planeObject = {
    useVertexBuffer: ctx.createArrayBufferObject(data.plane.vertices).useBuffer,
    useColorBuffer: ctx.createArrayBufferObject(data.plane.colors).useBuffer,
    useIndexBuffer: ctx.createElementArrayBufferObject(data.plane.indices).useBuffer,
    indexLength: data.plane.indices.length,
};

ctx.unBindArrayBuffer();
ctx.unBindElementArrayBuffer();

const frameBufferObject = ctx.createFramebufferObject({
    width: state.offscreenWidth,
    height: state.offscreenHeight,
});

ctx.gl.activeTexture(ctx.gl.TEXTURE0);
ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, frameBufferObject.texture);
ctx.depthTest.enable();

const viewProjMatrixFromLight = new GLHelper.Math.Matrix4();
viewProjMatrixFromLight.setPerspective(70, state.offscreenWidth / state.offscreenHeight, 1, 100);
viewProjMatrixFromLight.lookAt(
    GLHelper.Math.Vector3.create([state.lightX, state.lightY, state.lightZ]),
    GLHelper.Math.Vector3.create([0, 0, 0]),
    GLHelper.Math.Vector3.create([0, 1, 0]),
);

const triangleMvpMatrixFromLight = new GLHelper.Math.Matrix4();
const planeMvpMatrixFromLight = new GLHelper.Math.Matrix4();

const viewProjMatrix = new GLHelper.Math.Matrix4();
viewProjMatrix.setPerspective(45, ctx.width / ctx.height, 1, 100);
viewProjMatrix.lookAt(
    GLHelper.Math.Vector3.create([0.0, 7.0, 9.0]),
    GLHelper.Math.Vector3.create([0, 0, 0]),
    GLHelper.Math.Vector3.create([0, 1, 0]),
);

const globalModelMatrix = new GLHelper.Math.Matrix4();
const globalMvpMatrix = new GLHelper.Math.Matrix4();

type TProgramObject = typeof normalProgramObject | typeof shadowProgramObject;
type TEntityObject = typeof triangleObject | typeof planeObject;

const draw = (programObject: TProgramObject, viewProjMatrix: InstanceType<typeof GLHelper.Math.Matrix4>, entityObject: TEntityObject) => {
    entityObject.useVertexBuffer(programObject.shader.getAttributeLocation("a_Position"));

    if ((programObject as typeof normalProgramObject).shader.getAttribute("a_Color") !== null) {
        entityObject.useColorBuffer((programObject as typeof normalProgramObject).shader.getAttributeLocation("a_Color"));
    }

    entityObject.useIndexBuffer();

    globalMvpMatrix.set(viewProjMatrix);
    globalMvpMatrix.multiply(globalModelMatrix);
    ctx.uniformMatrix4fv(programObject.shader.getUniformLocation("u_MvpMatrix"), globalMvpMatrix);

    ctx.gl.drawElements(ctx.gl.TRIANGLES, triangleObject.indexLength, ctx.gl.UNSIGNED_BYTE, 0);
};
const drawTriangle = (programObject: TProgramObject, viewProjMatrix: InstanceType<typeof GLHelper.Math.Matrix4>) => {
    globalModelMatrix.setRotate(state.currentAngle, 0, 1, 0);
    draw(programObject, viewProjMatrix, triangleObject);
};

const drawPlane = (programObject: TProgramObject, viewProjMatrix: InstanceType<typeof GLHelper.Math.Matrix4>) => {
    globalModelMatrix.setRotate(-45, 0, 1, 1);
    draw(programObject, viewProjMatrix, planeObject);
};

GLHelper.Hooks.Render.addEventListener(() => {
    frameBufferObject.bindFramebuffer(); // 绑定 frameBuffer

    // 绘制阴影
    ctx.gl.viewport(0, 0, state.offscreenWidth, state.offscreenHeight);
    ctx.clear();

    ctx.useProgram(shadowProgramObject.program);
    drawTriangle(shadowProgramObject, viewProjMatrixFromLight);
    triangleMvpMatrixFromLight.set(globalMvpMatrix);
    drawPlane(shadowProgramObject, viewProjMatrixFromLight);
    planeMvpMatrixFromLight.set(globalMvpMatrix);

    frameBufferObject.unbindFramebuffer(); // 解绑 frameBuffer
    // 绘制实体
    ctx.gl.viewport(0, 0, ctx.width, ctx.height);
    ctx.clear();

    ctx.useProgram(normalProgramObject.program);
    ctx.gl.uniform1i(normalProgramObject.shader.getUniformLocation("u_ShadowMap"), 0);
    ctx.uniformMatrix4fv(normalProgramObject.shader.getUniformLocation("u_MvpMatrixFromLight"), triangleMvpMatrixFromLight);
    drawTriangle(normalProgramObject, viewProjMatrix);
    ctx.uniformMatrix4fv(normalProgramObject.shader.getUniformLocation("u_MvpMatrixFromLight"), planeMvpMatrixFromLight);
    drawPlane(normalProgramObject, viewProjMatrix);
});

GLHelper.Hooks.Update.addEventListener(() => {
    state.currentAngle += 1;
    state.currentAngle = state.currentAngle % 360;
    GLHelper.Hooks.Render.emit();
});
