import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const points = [
    [0, 0.5, 10.0, 1.0, 0, 0],
    [-0.5, -0.5, 20.0, 0, 1.0, 0],
    [0.5, -0.5, 30.0, 0, 0, 1.0],
];

const vertices = new Float32Array(points.flat());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_PointSize: {},
        a_Color: {},
    },
    uniforms: {
        u_FragColor: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const a_Position = shader.getAttributeLocation("a_Position");
const a_PointSize = shader.getAttributeLocation("a_PointSize");
const a_Color = shader.getAttributeLocation("a_Color");

ctx.createBuffer(vertices);
ctx.gl.vertexAttribPointer(a_Position, 2, ctx.gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 6, 0);
ctx.gl.enableVertexAttribArray(a_Position);

ctx.gl.vertexAttribPointer(a_PointSize, 1, ctx.gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 6, vertices.BYTES_PER_ELEMENT * 2);
ctx.gl.enableVertexAttribArray(a_PointSize);

ctx.gl.vertexAttribPointer(a_Color, 3, ctx.gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 6, vertices.BYTES_PER_ELEMENT * 3);
ctx.gl.enableVertexAttribArray(a_Color);

ctx.clear();
ctx.gl.drawArrays(ctx.gl.POINTS, 0, points.length);
