import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const points = [
    [0, 0.3],
    [-0.3, -0.3],
    [0.3, -0.3],
];

const vertices = new Float32Array(points.flat());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
    },
    uniforms: {
        u_FragColor: {},
        u_ModelMatrix: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const a_Position = shader.getAttributeLocation("a_Position");
const u_FragColor = shader.getUniformLocation("u_FragColor");

const u_ModelMatrix = shader.getUniformLocation("u_ModelMatrix");

const ANGLE = 60.0; // The rotation angle
const Tx = 0.5; // Translation distance
const modelMatrix = new GLHelper.Math.Matrix4();
modelMatrix.setRotate(ANGLE, 0, 0, 1);
modelMatrix.translate(Tx, 0, 0);

ctx.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

ctx.gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);
ctx.createVertexArrayBuffer(a_Position, vertices, 2);

let currentAngle = 0;

const draw = () => {
    currentAngle += GLHelper.Math.angle.value;
    if (currentAngle >= 360) {
        currentAngle = 0;
    }

    modelMatrix.setRotate(currentAngle, 0, 0, 1);
    ctx.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, points.length);
};

d3.timer(() => {
    draw();
});
