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
        u_ProjMatrix: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const verticesArr = [
    // 顶点和颜色
    // 绿色三角形 最后面
    [0.0, 0.5, -0.4, 0.4, 1.0, 0.4],
    [-0.5, -0.5, -0.4, 0.4, 1.0, 0.4],
    [0.5, -0.5, -0.4, 1.0, 0.4, 0.4],

    // 黄色三角形 中间
    [0.5, 0.4, -0.2, 1.0, 0.4, 0.4],
    [-0.5, 0.4, -0.2, 1.0, 1.0, 0.4],
    [0.0, -0.6, -0.2, 1.0, 1.0, 0.4],

    // 蓝色三角形 最前面
    [0.0, 0.5, 0.0, 0.4, 0.4, 1.0],
    [-0.5, -0.5, 0.0, 0.4, 0.4, 1.0],
    [0.5, -0.5, 0.0, 1.0, 0.4, 0.4],
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

const projMatrix = new GLHelper.Math.Matrix4();

GLHelper.Hooks.Render.addEventListener((d) => {
    projMatrix.setOrtho(-1, 1, -1, 1, d.near, d.far);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_ProjMatrix"), projMatrix);
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

createFormGroup("正交相机参数", [
    { name: "near", value: 0.0 },
    { name: "far", value: 0.5 },
]);

toolbarForm.dispatch("change");
