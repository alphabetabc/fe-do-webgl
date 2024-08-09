import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const points = [
    [-0.5, 0.5], // 第4象限
    [-0.5, -0.5], // 第3象限
    [0.5, 0.5], // 第1象限
    // [0.5, -0.5], // 第2象限
];

const vertices = new Float32Array(points.flat());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
    },
    uniforms: {
        u_FragColor: {},
        u_TransformMatrix: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const a_Position = shader.getAttributeLocation("a_Position");
const u_FragColor = shader.getUniformLocation("u_FragColor");
const u_TransformMatrix = shader.getUniformLocation("u_TransformMatrix");

/**
 * WebGL中采用列主序存储矩阵
 */
const matrix = {
    translate: (tx: any, ty: any, tz: any) => {
        return new Float32Array(
            [
                [1.0, 0, 0, 0],
                [0, 1.0, 0, 0],
                [0, 0, 1.0, 0],
                [tx, ty, tz, 1.0],
            ].flat(),
        );
    },
    rotate: (angle: number) => {
        return new Float32Array(
            [
                [Math.cos(angle), Math.sin(angle), 0, 0],
                [-Math.sin(angle), Math.cos(angle), 0, 0],
                [0, 0, 1.0, 0],
                [0, 0, 0, 1.0],
            ].flat(),
        );
    },
    scale: (scaleX: number, scaleY: number, scaleZ: number) => {
        return new Float32Array(
            [
                [scaleX, 0, 0, 0],
                [0, scaleY, 0, 0],
                [0, 0, scaleZ, 0],
                [0, 0, 0, 1.0],
            ].flat(),
        );
    },
};

ctx.gl.uniformMatrix4fv(u_TransformMatrix, false, matrix.scale(1.5, 1.5, 0));

ctx.gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);
ctx.createVertexArrayBuffer(a_Position, vertices, 2);

ctx.clear();
ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, points.length);

let x = 0;
d3.timer(() => {
    x += 0.01;
    if (x > 1) {
        x = 0;
    }
    // ctx.gl.uniformMatrix4fv(u_TransformMatrix, false, matrix.translate(0, x, 0));
    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, points.length);
});
