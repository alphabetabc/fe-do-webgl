import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const points = [
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
];

const sizes = new Float32Array([10.0, 20.0, 30.0]);

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

ctx.gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);
ctx.createVertexArrayBuffer(a_Position, vertices, 2);
ctx.createVertexArrayBuffer(a_PointSize, sizes, 1);

ctx.clear();
ctx.gl.drawArrays(ctx.gl.POINTS, 0, points.length);
