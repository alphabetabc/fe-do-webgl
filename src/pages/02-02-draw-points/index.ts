import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader, program } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const points = [];

const a_Position = ctx.gl.getAttribLocation(program, shader.getAttributeName("a_Position"));

ctx.container.addEventListener("mousedown", (ev: any) => {
    const rect = ev.target!.getBoundingClientRect();

    let x = ev.clientX;
    let y = ev.clientY;

    x = (x - rect.left - ctx.width / 2) / (ctx.width / 2);
    y = (ctx.height / 2 - (y - rect.top)) / (ctx.height / 2);

    points.push({ x, y });

    if (points.length > 0) {
        ctx.clear();
        points.forEach((point) => {
            ctx.gl.vertexAttrib3fv(a_Position, [point.x, point.y, 0]);
            ctx.gl.drawArrays(ctx.gl.POINTS, 0, 1);
        });
    }
});
