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
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const points = [
    [-0.5, 0.5], // 第4象限
    [-0.5, -0.5], // 第3象限
    [0.5, 0.5], // 第1象限
    [0.5, -0.5], // 第2象限
];

const vertices = new Float32Array(points.flat());

const a_Position = shader.getAttributeLocation("a_Position");
const u_FragColor = shader.getUniformLocation("u_FragColor");
ctx.gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);
ctx.createVertexArrayBuffer(a_Position, vertices, 2);

ctx.clear();
ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, points.length);

const toolbar = d3.select("#toolbar");
GLHelper.Dom.setStyle(toolbar.node() as any, {
    left: "900px",
    top: "50px",
});
toolbar
    .selectAll(".item")
    .data([
        { name: "三角带", value: ctx.gl.TRIANGLE_STRIP },
        { name: "三角扇", value: ctx.gl.TRIANGLE_FAN },
    ])
    .join("div")
    .classed(".item", true)
    .text((d) => d.name)
    .style("margin", "10px")
    .style("padding", "5px")
    .style("background", "#ccc")
    .style("text-align", "center")
    .style("color", "#000")
    .style("cursor", "pointer")
    .on("click", (e, d) => {
        ctx.clear();
        // 共享顶点
        ctx.gl.drawArrays(d.value, 0, points.length);
    });
