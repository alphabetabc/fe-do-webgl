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

const a_Position = shader.getAttributeLocation("a_Position");
const u_FragColor = shader.getUniformLocation("u_FragColor");

const points = [];
const colors = [];

ctx.container.addEventListener("mousedown", (ev: any) => {
    const rect = ev.target!.getBoundingClientRect();

    let x = ev.clientX;
    let y = ev.clientY;

    x = (x - rect.left - ctx.width / 2) / (ctx.width / 2);
    y = (ctx.height / 2 - (y - rect.top)) / (ctx.height / 2);

    points.push({ x, y });

    // 生成颜色
    if (x >= 0.0 && y >= 0.0) {
        colors.push([1.0, 0.0, 0.0]); // 第一象限 红色
    } else if (x < 0.0 && y < 0.0) {
        colors.push([0.0, 1.0, 0.0]); // 第二象限 绿色
    } else {
        colors.push([1.0, 1.0, 1.0]); // 白色
    }

    if (points.length > 0) {
        ctx.clear();
        points.forEach((point, index) => {
            ctx.gl.vertexAttrib3fv(a_Position, [point.x, point.y, 0]);
            ctx.gl.uniform4fv(u_FragColor, [...colors[index], 1.0]);
            ctx.gl.drawArrays(ctx.gl.POINTS, 0, 1);
        });
    }
});
