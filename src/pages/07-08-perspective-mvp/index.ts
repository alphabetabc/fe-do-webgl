import * as d3 from "d3";
import { GLHelper } from "@utils";
import { toolbarForm, createFormGroup } from "../../components/toolbar-ui";

import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },

    uniforms: {
        u_MvpMatrix: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const verticesArr = [
    // Three triangles on the right side
    [0.75, 1.0, -4.0, 0.4, 1.0, 0.4], // The back green one
    [0.25, -1.0, -4.0, 0.4, 1.0, 0.4],
    [1.25, -1.0, -4.0, 1.0, 0.4, 0.4],

    [0.75, 1.0, -2.0, 1.0, 1.0, 0.4], // The middle yellow one
    [0.25, -1.0, -2.0, 1.0, 1.0, 0.4],
    [1.25, -1.0, -2.0, 1.0, 0.4, 0.4],

    [0.75, 1.0, 0.0, 0.4, 0.4, 1.0], // The front blue one
    [0.25, -1.0, 0.0, 0.4, 0.4, 1.0],
    [1.25, -1.0, 0.0, 1.0, 0.4, 0.4],

    // Three triangles on the left side
    [-0.75, 1.0, -4.0, 0.4, 1.0, 0.4], // The back green one
    [-1.25, -1.0, -4.0, 0.4, 1.0, 0.4],
    [-0.25, -1.0, -4.0, 1.0, 0.4, 0.4],

    [-0.75, 1.0, -2.0, 1.0, 1.0, 0.4], // The middle yellow one
    [-1.25, -1.0, -2.0, 1.0, 1.0, 0.4],
    [-0.25, -1.0, -2.0, 1.0, 0.4, 0.4],

    [-0.75, 1.0, 0.0, 0.4, 0.4, 1.0], // The front blue one
    [-1.25, -1.0, 0.0, 0.4, 0.4, 1.0],
    [-0.25, -1.0, 0.0, 1.0, 0.4, 0.4],
];

const vertices = new Float32Array(verticesArr.flat());

const size = vertices.BYTES_PER_ELEMENT;

{
    ctx.createBuffer(vertices);
    const a_Position = shader.getAttributeLocation("a_Position");
    ctx.gl.vertexAttribPointer(a_Position, 3, ctx.gl.FLOAT, false, 6 * size, 0 * size);
    ctx.gl.enableVertexAttribArray(a_Position);

    const a_Color = shader.getAttributeLocation("a_Color");
    ctx.gl.vertexAttribPointer(a_Color, 3, ctx.gl.FLOAT, false, 6 * size, 3 * size);
    ctx.gl.enableVertexAttribArray(a_Color);
}

const mvpMatrix = new GLHelper.Math.Matrix4();
const viewMatrix = new GLHelper.Math.Matrix4();
const projMatrix = new GLHelper.Math.Matrix4();
const modelMatrix = new GLHelper.Math.Matrix4();

GLHelper.Hooks.Render.addEventListener((d) => {
    viewMatrix.setLookAt(
        GLHelper.Math.Vector3.fromXYZ(d.eyeX, d.eyeY, d.eyeZ),
        GLHelper.Math.Vector3.fromXYZ(0, 0, -100),
        GLHelper.Math.Vector3.fromXYZ(0, 1, 0),
    );
    modelMatrix.setTranslate(d.tx, 0, 0);
    projMatrix.setPerspective(d.fovY, ctx.width / ctx.height, d.near, d.far);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);
    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, verticesArr.length);
});

toolbarForm.on("change", (e) => {
    const formData = new FormData(toolbarForm.node());
    const obj = {};
    Array.from(formData.entries(), (entry) => {
        const [key, value] = entry;
        const [, prop] = key.split(":");

        obj[prop] = Number(value) ?? 0;
    });

    GLHelper.Hooks.Render.emit(obj);
});

createFormGroup("模型矩阵参数", [
    //
    { name: "tx", value: 0.75 },
]);

createFormGroup("透视相机参数", [
    { name: "fovY", value: 30.0 },
    { name: "near", value: 1.0 },
    { name: "far", value: 100.0 },
]);

createFormGroup("视点参数", [
    { name: "eyeX", value: 0 },
    { name: "eyeY", value: 0 },
    { name: "eyeZ", value: 5 },
]);

toolbarForm.dispatch("change");
