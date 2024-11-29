import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const vertices = new Float32Array(
    [
        [0.0, 0.5],
        [-0.5, -0.5],
        [0.5, -0.5],
    ].flat(),
);
const colors = new Float32Array(
    [
        [1.0, 0.0, 0.0], // red
        [0.0, 1.0, 0.0], // green
        [0.0, 0.0, 1.0], // blue
    ].flat(),
);

ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Position"), vertices);
ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Color"), colors);

GLHelper.Hooks.Render.addEventListener(() => {
    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.POINTS, 0, vertices.BYTES_PER_ELEMENT);
});
GLHelper.Hooks.Render.emit();
