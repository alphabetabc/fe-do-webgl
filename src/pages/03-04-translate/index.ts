import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
    },
    uniforms: {
        u_FragColor: {},
        u_Translation: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const points = [
    [-0.5, 0.5], // 第4象限
    [-0.5, -0.5], // 第3象限
    [0.5, 0.5], // 第1象限
    // [0.5, -0.5], // 第2象限
];

const vertices = new Float32Array(points.flat());

const a_Position = shader.getAttributeLocation("a_Position");
const u_FragColor = shader.getUniformLocation("u_FragColor");
const u_Translation = shader.getUniformLocation("u_Translation");

const translateVector = GLHelper.Math.Vector4.create([0.0, 1.0, 1.0, 1.0]);

ctx.gl.uniform4fv(u_Translation, translateVector.elements);
ctx.gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);
ctx.createVertexArrayBuffer(a_Position, vertices, 2);

ctx.clear();
ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, points.length);

GLHelper.Hooks.Update.addEventListener(() => {
    translateVector.elements[0] += 0.01;
    if (translateVector.elements[0] > 1.5) {
        translateVector.elements[0] = 0;
    }
    ctx.gl.uniform4fv(u_Translation, translateVector.elements);
    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, points.length);
});
