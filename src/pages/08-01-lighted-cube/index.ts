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
        a_Normal: {},
    },

    uniforms: {
        u_MvpMatrix: {},
        u_LightColor: {},
        u_LightDirection: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

// 灯光
ctx.gl.uniform3f(shader.getUniformLocation("u_LightColor"), 1.0, 1.0, 1.0);
// 灯光方向
const lightDirection = GLHelper.Math.Vector3.fromXYZ(0.5, 3.0, 4.0);
lightDirection.normalize();
ctx.gl.uniform3fv(shader.getUniformLocation("u_LightDirection"), lightDirection.elements);

const createVertexBuffer = (location: GLuint, vertices: Float32Array) => {
    const size = vertices.BYTES_PER_ELEMENT;
    ctx.createBuffer(vertices);
    ctx.gl.vertexAttribPointer(location, 3, ctx.gl.FLOAT, false, 3 * size, 0 * size);
    ctx.gl.enableVertexAttribArray(location);
};

// 点+颜色
// Create a cube
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

{
    const verticesArr = [
        // Vertex coordinates
        [1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0], // v0-v1-v2-v3 front
        [1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0], // v0-v3-v4-v5 right
        [1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0], // v0-v5-v6-v1 up
        [-1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0], // v1-v6-v7-v2 left
        [-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0], // v7-v4-v3-v2 down
        [1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0], // v4-v7-v6-v5 back
    ];
    const vertices = new Float32Array(verticesArr.flat());
    // const size = vertices.BYTES_PER_ELEMENT;
    // ctx.createBuffer(vertices);
    // const a_Position = shader.getAttributeLocation("a_Position");
    // ctx.gl.vertexAttribPointer(a_Position, 3, ctx.gl.FLOAT, false, 3 * size, 0 * size);
    // ctx.gl.enableVertexAttribArray(a_Position);
    createVertexBuffer(shader.getAttributeLocation("a_Position"), vertices);
}

{
    const colors = [
        // Colors
        [0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0], // v0-v1-v2-v3 front(blue)
        [0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4], // v0-v3-v4-v5 right(green)
        [1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4], // v0-v5-v6-v1 up(red)
        [1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4], // v1-v6-v7-v2 left
        [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // v7-v4-v3-v2 down
        [0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0], // v4-v7-v6-v5 back
    ];
    const vertices = new Float32Array(colors.flat());
    // const size = vertices.BYTES_PER_ELEMENT;
    // ctx.createBuffer(vertices);
    // const a_Color = shader.getAttributeLocation("a_Color");
    // ctx.gl.vertexAttribPointer(a_Color, 3, ctx.gl.FLOAT, false, 3 * size, 0);
    // ctx.gl.enableVertexAttribArray(a_Color);
    createVertexBuffer(shader.getAttributeLocation("a_Color"), vertices);
}

{
    const normals = [
        // Normal
        [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0], // v0-v1-v2-v3 front
        [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0], // v0-v3-v4-v5 right
        [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0], // v0-v5-v6-v1 up
        [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0], // v1-v6-v7-v2 left
        [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0], // v7-v4-v3-v2 down
        [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0], // v4-v7-v6-v5 back
    ];
    const nos = new Float32Array(normals.flat());
    createVertexBuffer(shader.getAttributeLocation("a_Normal"), nos);
}

// 顶点索引
const vertexIndexArr = [
    [0, 1, 2, 0, 2, 3], // front
    [4, 5, 6, 4, 6, 7], // right
    [8, 9, 10, 8, 10, 11], // up
    [12, 13, 14, 12, 14, 15], // left
    [16, 17, 18, 16, 18, 19], // down
    [20, 21, 22, 20, 22, 23], // back
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
    mvpMatrix.rotate(d.angle, 1, -1, 1);

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
    i += 1;
    if (i > 360) {
        i = 0;
    }
    updateFormValues({ angle: i });
});

toolbarForm.dispatch("change");
