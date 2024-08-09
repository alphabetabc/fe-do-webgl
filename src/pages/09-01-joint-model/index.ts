import { GLHelper } from "@utils";
import { toolbarForm, createFormGroup, updateFormValues } from "../../components/toolbar-ui";

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
    GLHelper.Math.Vector3.fromXYZ(20, 10, 30),
    GLHelper.Math.Vector3.fromXYZ(0.0, 0.0, 0.0),
    GLHelper.Math.Vector3.fromXYZ(0.0, 1.0, 0.0),
);

const boxModelMatrix = new GLHelper.Math.Matrix4();
const boxMvpMatrix = new GLHelper.Math.Matrix4();
const boxNormalMatrix = new GLHelper.Math.Matrix4();

const drawBox = (boxModelMatrix: any) => {
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
    const arm1Length = 10;
    boxModelMatrix.setTranslate(d.txArm1, d.tyArm1, d.tzArm1);
    boxModelMatrix.rotate(d.rotateArm1, 0, 1, 0);
    drawBox(boxModelMatrix);

    boxModelMatrix.translate(0.0, arm1Length, 0.0);
    boxModelMatrix.rotate(d.rotateJoin1, 0, 1, 1);
    boxModelMatrix.scale(1.3, 1.0, 1.3);
    drawBox(boxModelMatrix);
});

const state = {
    rotateArm1: 0,
    rotateJoin1: 0,
    step: 1.5,
    count: 0,

    txArm1: 0,
    tyArm1: -12,
    tzArm1: 0,
};

toolbarForm.on("change", (e) => {
    const formData = new FormData(toolbarForm.node());
    Array.from(formData.entries(), (entry) => {
        const [key, value] = entry;
        const [, prop] = key.split(":");

        state[prop] = Number(value) ?? 0;
    });

    GLHelper.Hooks.Render.emit(state);
});

createFormGroup("modelMatrix控制", [
    { name: "txArm1", value: state.txArm1 },
    { name: "tyArm1", value: state.tyArm1 },
    { name: "tzArm1", value: state.tzArm1 },
]);

GLHelper.Hooks.Update.addEventListener(() => {
    state.count += state.step;
    if (state.count > 360) {
        state.count = 0;
    }

    state.rotateArm1 = state.count;
    state.rotateJoin1 = Math.sin(GLHelper.Math.toRadian(state.count)) * 135;

    GLHelper.Hooks.Render.emit(state);
});
