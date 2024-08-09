import { GLHelper } from "@utils";

import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { vertices, normals, indices } from "./data";

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

ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Position"), vertices, 3);
ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Normal"), normals, 3);
ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, null);

ctx.createElementArrayBuffer(indices);

const viewProjMatrix = new GLHelper.Math.Matrix4();
viewProjMatrix.setPerspective(50.0, ctx.width / ctx.height, 0.1, 100.0);
viewProjMatrix.lookAt(
    GLHelper.Math.Vector3.fromXYZ(20.0, 10.0, 30.0),
    GLHelper.Math.Vector3.fromXYZ(0.0, 0.0, 0.0),
    GLHelper.Math.Vector3.fromXYZ(0.0, 1.0, 0.0),
);

let boxModelMatrix = new GLHelper.Math.Matrix4();
const boxMvpMatrix = new GLHelper.Math.Matrix4();
const boxNormalMatrix = new GLHelper.Math.Matrix4();

const drawBox = (width: number, height: number, depth: number) => {
    ctx.matrixStack.save(boxModelMatrix);

    boxModelMatrix.scale(width, height, depth);

    boxMvpMatrix.set(viewProjMatrix);
    boxMvpMatrix.multiply(boxModelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), boxMvpMatrix);

    boxNormalMatrix.setInverseOf(boxModelMatrix);
    boxNormalMatrix.transpose();
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_NormalMatrix"), boxNormalMatrix);

    ctx.gl.drawElements(ctx.gl.TRIANGLES, indices.length, ctx.gl.UNSIGNED_BYTE, 0);

    boxModelMatrix = ctx.matrixStack.restore();
};

GLHelper.Hooks.Render.addEventListener((d) => {
    ctx.clear();

    // base
    const baseHeight = 2.0;
    boxModelMatrix.setTranslate(d.txArm1, d.tyArm1, d.tzArm1);
    drawBox(10.0, baseHeight, 10.0);

    // arm1
    const arm1Length = 10.0;
    boxModelMatrix.translate(0.0, baseHeight, 0.0);
    boxModelMatrix.rotate(d.rotateArm1, 0.0, 1.0, 0.0);
    drawBox(3.0, arm1Length, 3.0);

    // arm2
    const arm2Length = 10.0;
    boxModelMatrix.translate(0.0, arm1Length, 0.0);
    boxModelMatrix.rotate(d.rotateJoin1, 0.0, 0.0, 1.0);
    drawBox(4.0, arm2Length, 4.0);

    // palm
    const palmLength = 2.0;
    boxModelMatrix.translate(0.0, arm2Length, 0.0);
    boxModelMatrix.rotate(d.rotateJoin2, 0.0, 1.0, 0.0);
    drawBox(2.0, palmLength, 6.0);

    boxModelMatrix.translate(0.0, palmLength, 0.0);

    // finger1
    ctx.matrixStack.save(boxModelMatrix);
    boxModelMatrix.translate(0.0, 0.0, 2.0);
    boxModelMatrix.rotate(d.rotateFinger, 1.0, 0.0, 0.0);
    drawBox(1.0, 2.0, 1.0);
    boxModelMatrix = ctx.matrixStack.restore();

    // finger2
    boxModelMatrix.translate(0.0, 0.0, -2.0);
    boxModelMatrix.rotate(-d.rotateFinger, 1.0, 0.0, 0.0);
    drawBox(1.0, 2.0, 1.0);
});

const state = {
    rotateArm1: 90,
    rotateJoin1: 0,
    rotateJoin2: 0,
    rotateFinger: 0,

    step: 1.5,
    count: 0,

    txArm1: 0,
    tyArm1: -12,
    tzArm1: 0,
};

GLHelper.Hooks.Render.emit(state);

window.addEventListener("keydown", (ev) => {
    switch (ev.code) {
        case "ArrowLeft":
            state.rotateArm1 = (state.rotateArm1 - state.step) % 360;
            break;
        case "ArrowRight":
            state.rotateArm1 = (state.rotateArm1 + state.step) % 360;
            break;
        case "ArrowUp":
            if (state.rotateJoin1 < 135.0) state.rotateJoin1 += state.step;
            break;
        case "ArrowDown":
            if (state.rotateJoin1 > -135.0) state.rotateJoin1 -= state.step;
            break;
        case "KeyZ":
            state.rotateJoin2 = (state.rotateJoin2 + state.step) % 360;
            break;
        case "KeyX":
            state.rotateJoin2 = (state.rotateJoin2 - state.step) % 360;
            break;
        case "KeyC":
            if (state.rotateFinger > -60.0) {
                state.rotateFinger = (state.rotateFinger - state.step) % 360;
            }
            break;
        case "KeyV":
            if (state.rotateFinger < 60.0) {
                state.rotateFinger = (state.rotateFinger + state.step) % 360;
            }
            break;

        default:
            return;
    }

    GLHelper.Hooks.Render.emit(state);
});

GLHelper.Hooks.Update.addEventListener(() => {
    state.count += state.step;
    if (state.count > 360) {
        state.count = 0;
    }

    state.rotateArm1 = state.count;
    state.rotateJoin1 = Math.sin(GLHelper.Math.toRadian(state.count)) * 135;
    state.rotateJoin2 = state.count;
    state.rotateFinger = Math.sin(GLHelper.Math.toRadian(state.count)) * 60;

    GLHelper.Hooks.Render.emit(state);
});
