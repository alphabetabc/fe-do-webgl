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
        u_LightPosition: {},
        u_AmbientLight: {},
        u_NormalMatrix: {},
        u_ModelMatrix: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

// 灯光
ctx.gl.uniform3f(shader.getUniformLocation("u_LightColor"), 1.0, 1.0, 1.0);

// 环境光
ctx.gl.uniform3f(shader.getUniformLocation("u_AmbientLight"), 0.2, 0.2, 0.2);

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

const modelMatrix = new GLHelper.Math.Matrix4();
const mvpMatrix = new GLHelper.Math.Matrix4();
const normalMatrix = new GLHelper.Math.Matrix4();

GLHelper.Hooks.Render.addEventListener((d) => {
    // 点光源的位置
    ctx.gl.uniform3f(shader.getUniformLocation("u_LightPosition"), d.pointLightX, d.pointLightY, d.pointLightZ);

    mvpMatrix.setPerspective(d.fovY, ctx.width / ctx.height, d.near, d.far);
    mvpMatrix.lookAt(
        GLHelper.Math.Vector3.fromXYZ(d.eyeX, d.eyeY, d.eyeZ),
        GLHelper.Math.Vector3.fromXYZ(0, 0, -2),
        GLHelper.Math.Vector3.fromXYZ(0, 1, 0),
    );

    modelMatrix.setTranslate(d.tx, d.ty, d.tz); // 平移
    modelMatrix.rotate(d.angle, 0, 0, 1); // 旋转
    mvpMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    // 根据模型矩阵来计算变换法向量矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_NormalMatrix"), normalMatrix);

    ctx.uniformMatrix4fv(shader.getUniformLocation("u_ModelMatrix"), modelMatrix);

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

createFormGroup("模型矩阵控制", [
    { name: "angle", value: 0 },
    { name: "tx", value: 0 },
    { name: "ty", value: 1 },
    { name: "tz", value: 0 },
]);

createFormGroup("点光源的位置", [
    { name: "pointLightX", value: 0 },
    { name: "pointLightY", value: 3 },
    { name: "pointLightZ", value: 4 },
]);

let i = 0;
GLHelper.Hooks.Update.addEventListener(() => {
    if (i > 360) {
        i = 0;
    } else {
        i += 1;
    }
    updateFormValues({ angle: i });
});

toolbarForm.dispatch("change");
