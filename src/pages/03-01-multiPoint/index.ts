import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader, program } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
    },
    uniforms: {
        u_FragColor: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const points = [
    [0, 0], // 中心
    [0.5, 0.5], // 第1象限
    [0.5, -0.5], // 第2象限
    [-0.5, -0.5], // 第3象限
    [-0.5, 0.5], // 第4象限
];

const vertices = new Float32Array(points.flat());

const a_Position = shader.getAttributeLocation("a_Position");
const u_FragColor = shader.getUniformLocation("u_FragColor");
ctx.gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);
ctx.createVertexArrayBuffer(a_Position, vertices, 2);
ctx.clear();

ctx.gl.drawArrays(ctx.gl.POINTS, 0, points.length);
