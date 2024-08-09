import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },

    uniforms: {
        u_ModelViewMatrix: {},
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

const viewMatrix = new GLHelper.Math.Matrix4();
const modelMatrix = new GLHelper.Math.Matrix4();

GLHelper.Hooks.Render.addEventListener((d) => {
    viewMatrix.setLookAt(d.eye, d.center, d.up);
    // const u_ViewMatrix = shader.getUniformLocation("u_ViewMatrix");
    // ctx.gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    modelMatrix.setRotate(d.rotate, 0, 0, 1);
    // const u_ModelMatrix = shader.getUniformLocation("u_ModelMatrix");
    // ctx.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // 矩阵相乘放到外面
    // 因为矩阵相乘是耗性能的，传入shader里面再计算的话性能耗损大
    const mvMatrix = viewMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_ModelViewMatrix"), mvMatrix);

    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, verticesArr.length);
});

let i = 0;
GLHelper.Hooks.Update.addEventListener(() => {
    i += GLHelper.Math.angle.value * 0.1;
    if (i > GLHelper.Math.angle.value * 360) {
        i = 0;
    }
    GLHelper.Hooks.Render.emit({
        eye: GLHelper.Math.Vector3.create([0.2, 0.25, 0.25]),
        center: GLHelper.Math.Vector3.create([0, 0, 0]),
        up: GLHelper.Math.Vector3.create([0, 1, 0]),
        rotate: i,
    });
});
