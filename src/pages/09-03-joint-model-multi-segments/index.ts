import { GLHelper } from "@utils";

import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { verticesBase, verticesArm1, verticesArm2, verticesPalm, verticesFinger, normals, indices } from "./data";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Normal: {},
    },
    uniforms: {
        u_MvpMatrix: {},
        u_NormalMatrix: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Normal"), normals, 3);
ctx.createElementArrayBuffer(indices);
const baseBuffer = ctx.createArrayBufferObject(verticesBase);
const arm1Buffer = ctx.createArrayBufferObject(verticesArm1);
const arm2Buffer = ctx.createArrayBufferObject(verticesArm2);
const palmBuffer = ctx.createArrayBufferObject(verticesPalm);
const fingerBuffer = ctx.createArrayBufferObject(verticesFinger);

const createFloatUseBufferExecutor = (bufferObject: ReturnType<GLHelper.WebGLRendererContext["createArrayBufferObject"]>) => {
    return bufferObject.createUseBufferExecutor(shader.getAttributeLocation("a_Position"), {
        type: ctx.gl.FLOAT,
        size: 3,
    });
};

const useSegmentsBufferMapping = {
    base: createFloatUseBufferExecutor(baseBuffer),
    arm1: createFloatUseBufferExecutor(arm1Buffer),
    arm2: createFloatUseBufferExecutor(arm2Buffer),
    palm: createFloatUseBufferExecutor(palmBuffer),
    finger: createFloatUseBufferExecutor(fingerBuffer),
};

const state = {
    rotateArm1: 90,
    rotateJoin1: 45,
    rotateJoin2: 0,
    rotateFinger: 0,

    step: 1.5,
    count: 0,

    txArm1: 0,
    tyArm1: -12,
    tzArm1: 0,
};

const viewProjMatrix = GLHelper.Math.Matrix4.create();
viewProjMatrix.setPerspective(50.0, ctx.width / ctx.height, 0.1, 100.0);
viewProjMatrix.lookAt(
    GLHelper.Math.Vector3.fromXYZ(20.0, 10.0, 30.0),
    GLHelper.Math.Vector3.fromXYZ(0.0, 0.0, 0.0),
    GLHelper.Math.Vector3.fromXYZ(0.0, 1.0, 0.0),
);

let boxModelMatrix = GLHelper.Math.Matrix4.create();
const boxMvpMatrix = GLHelper.Math.Matrix4.create();
const boxNormalMatrix = GLHelper.Math.Matrix4.create();

const drawSegments = (useSegmentBuffer: ReturnType<typeof createFloatUseBufferExecutor>) => {
    useSegmentBuffer();

    boxMvpMatrix.set(viewProjMatrix);
    boxMvpMatrix.multiply(boxModelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), boxMvpMatrix);

    boxNormalMatrix.setInverseOf(boxModelMatrix);
    boxNormalMatrix.transpose();
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_NormalMatrix"), boxNormalMatrix);

    ctx.gl.drawElements(ctx.gl.TRIANGLES, indices.length, ctx.gl.UNSIGNED_BYTE, 0);
};

GLHelper.Hooks.Render.addEventListener((d) => {
    ctx.clear();

    // 基座
    const baseHeight = 2;
    boxModelMatrix.setTranslate(d.txArm1, d.tyArm1, d.tzArm1);
    drawSegments(useSegmentsBufferMapping.base);

    // 手臂1
    const arm1Height = 10.0;
    boxModelMatrix.translate(0, baseHeight, 0);
    boxModelMatrix.rotate(d.rotateArm1, 0.0, 1.0, 0.0);
    drawSegments(useSegmentsBufferMapping.arm1);

    // 手臂2
    const arm2Height = 10.0;
    boxModelMatrix.translate(0, arm1Height, 0);
    boxModelMatrix.rotate(d.rotateJoin1, 0.0, 0.0, 1.0);
    drawSegments(useSegmentsBufferMapping.arm2);

    // 手掌
    const palmLength = 2.0;
    boxModelMatrix.translate(0.0, arm2Height, 0.0);
    boxModelMatrix.rotate(d.rotateJoin2, 0.0, 1.0, 0.0);
    drawSegments(useSegmentsBufferMapping.palm);

    boxModelMatrix.translate(0.0, palmLength, 0.0);

    // 手指1
    ctx.matrixStack.save(boxModelMatrix);
    boxModelMatrix.translate(0.0, 0.0, 2.0);
    boxModelMatrix.rotate(d.rotateFinger, 1.0, 0.0, 0.0);
    drawSegments(useSegmentsBufferMapping.finger);
    boxModelMatrix = ctx.matrixStack.restore();

    // 手指2
    boxModelMatrix.translate(0.0, 0.0, -2.0);
    boxModelMatrix.rotate(-d.rotateFinger, 1.0, 0.0, 0.0);
    drawSegments(useSegmentsBufferMapping.finger);
});

GLHelper.Hooks.Update.addEventListener(() => {
    state.count += state.step;
    if (state.count > 360) {
        state.count = 0;
    }

    state.rotateArm1 = state.count;
    state.rotateJoin1 = Math.sin(GLHelper.Math.toRadian(state.count)) * 135;
    state.rotateJoin2 = state.count;
    state.rotateFinger = Math.cos(GLHelper.Math.toRadian(state.count)) * 60;

    GLHelper.Hooks.Render.emit(state);
});

GLHelper.Hooks.Render.emit(state);
