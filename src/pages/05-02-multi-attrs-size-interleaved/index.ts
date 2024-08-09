import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const points = [
    [0, 0.5, 10.0],
    [-0.5, -0.5, 20.0],
    [0.5, -0.5, 30.0],
];

const vertices = new Float32Array(points.flat());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_PointSize: {},
    },
    uniforms: {
        u_FragColor: {},
        u_ModelMatrix: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const a_Position = shader.getAttributeLocation("a_Position");
const a_PointSize = shader.getAttributeLocation("a_PointSize");
const u_FragColor = shader.getUniformLocation("u_FragColor");

const u_ModelMatrix = shader.getUniformLocation("u_ModelMatrix");

const ANGLE = 0.0; // The rotation angle
const modelMatrix = new GLHelper.Math.Matrix4();
modelMatrix.setRotate(ANGLE, 0, 0, 1);
modelMatrix.translate(0, 0, 0);

ctx.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

ctx.createBuffer(vertices);
ctx.gl.vertexAttribPointer(a_Position, 2, ctx.gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 3, 0);
ctx.gl.enableVertexAttribArray(a_Position);

ctx.gl.vertexAttribPointer(a_PointSize, 1, ctx.gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 3, vertices.BYTES_PER_ELEMENT * 2);
ctx.gl.enableVertexAttribArray(a_PointSize);

ctx.gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);

ctx.clear();
ctx.gl.drawArrays(ctx.gl.POINTS, 0, points.length);
