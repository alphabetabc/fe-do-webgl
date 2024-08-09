import * as d3 from "d3";
import { GLHelper } from "@utils";
import { toolbarForm, createFormGroup, createFormItem, updateFormValues } from "../../components/toolbar-ui";

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

// 点+颜色
// Create a cube
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3
const verticesArr = [
    [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // v0 White
    [-1.0, 1.0, 1.0, 1.0, 0.0, 1.0], // v1 Magenta
    [-1.0, -1.0, 1.0, 1.0, 0.0, 0.0], // v2 Red
    [1.0, -1.0, 1.0, 1.0, 1.0, 0.0], // v3 Yellow
    [1.0, -1.0, -1.0, 0.0, 1.0, 0.0], // v4 Green
    [1.0, 1.0, -1.0, 0.0, 1.0, 1.0], // v5 Cyan
    [-1.0, 1.0, -1.0, 0.0, 0.0, 1.0], // v6 Blue
    [-1.0, -1.0, -1.0, 0.0, 0.0, 0.0], // v7 Black
];
{
    const vertices = new Float32Array(verticesArr.flat());

    const size = vertices.BYTES_PER_ELEMENT;

    ctx.createBuffer(vertices);
    const a_Position = shader.getAttributeLocation("a_Position");
    ctx.gl.vertexAttribPointer(a_Position, 3, ctx.gl.FLOAT, false, 6 * size, 0 * size);
    ctx.gl.enableVertexAttribArray(a_Position);

    const a_Color = shader.getAttributeLocation("a_Color");
    ctx.gl.vertexAttribPointer(a_Color, 3, ctx.gl.FLOAT, false, 6 * size, 3 * size);
    ctx.gl.enableVertexAttribArray(a_Color);
}

// 顶点索引
const vertexIndexArr = [
    [0, 1, 2, 0, 2, 3], // front
    [0, 3, 4, 0, 4, 5], // right
    [0, 5, 6, 0, 6, 1], // up
    [1, 6, 7, 1, 7, 2], // left
    [7, 4, 3, 7, 3, 2], // down
    [4, 7, 6, 4, 6, 5], // back
];
{
    const vertexIndex = new Uint8Array(vertexIndexArr.flat());
    ctx.createElementArrayBuffer(vertexIndex);
}

/**
 * 顶点的个数
 */
const vertexCount = vertexIndexArr.length * 6;

const mvpMatrix = new GLHelper.Math.Matrix4();

GLHelper.Hooks.Render.addEventListener((d) => {
    mvpMatrix.setPerspective(d.fovY, ctx.width / ctx.height, d.near, d.far);
    mvpMatrix.lookAt(
        GLHelper.Math.Vector3.fromXYZ(d.eyeX, d.eyeY, d.eyeZ),
        GLHelper.Math.Vector3.fromXYZ(0, 0, -2),
        GLHelper.Math.Vector3.fromXYZ(0, 1, 0),
    );
    mvpMatrix.rotate(d.angle, 0, 1, 0);

    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    ctx.clear();
    /**
     * 绘制图形
     * 指定顶点的个数 count
     */
    ctx.gl.drawElements(ctx.gl.TRIANGLES, vertexCount, ctx.gl.UNSIGNED_BYTE, 0);
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

createFormGroup("透视相机参数", [
    { name: "fovY", value: 30.0 },
    { name: "near", value: 0.1 },
    { name: "far", value: 100.0 },
]);

createFormGroup("视点参数", [
    { name: "eyeX", value: 3 },
    { name: "eyeY", value: 3 },
    { name: "eyeZ", value: 10 },
]);

createFormGroup("角度控制", [{ name: "angle", value: 0 }]);

let i = 0;
GLHelper.Hooks.Update.addEventListener(() => {
    i += 3;
    if (i > 360) {
        i = 0;
    }
    updateFormValues({ angle: i });
});

toolbarForm.dispatch("change");
