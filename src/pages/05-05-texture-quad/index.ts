import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_TexCoord: {},
    },
    uniforms: {
        u_Sampler: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const a_Position = shader.getAttributeLocation("a_Position");
const a_TexCoord = shader.getAttributeLocation("a_TexCoord");
const u_Sampler = shader.getUniformLocation("u_Sampler");

GLHelper.Hooks.Render.addEventListener((d) => {
    const vertices = new Float32Array(d.verticesArr.flat());
    ctx.createBuffer(vertices);

    const size = vertices.BYTES_PER_ELEMENT;

    ctx.gl.vertexAttribPointer(a_Position, 2, ctx.gl.FLOAT, false, 4 * size, 0 * size);
    ctx.gl.enableVertexAttribArray(a_Position);

    ctx.gl.vertexAttribPointer(a_TexCoord, 2, ctx.gl.FLOAT, false, 4 * size, 2 * size);
    ctx.gl.enableVertexAttribArray(a_TexCoord);

    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, d.verticesArr.length);
});

const toolbar = d3.select("#toolbar");
GLHelper.Dom.setStyle(toolbar.node() as any, {
    left: "850px",
    top: "50px",
});
toolbar
    .selectAll(".item")
    .data([
        {
            name: "正常",
            verticesArr: [
                [-0.5, 0.5, 0.0, 1.0],
                [-0.5, -0.5, 0.0, 0.0],
                [0.5, 0.5, 1.0, 1.0],
                [0.5, -0.5, 1.0, 0.0],
            ],
        },
        {
            name: "repeat",
            verticesArr: [
                [-0.5, 0.5, -0.3, 1.7],
                [-0.5, -0.5, -0.3, -0.2],
                [0.5, 0.5, 1.7, 1.7],
                [0.5, -0.5, 1.7, -0.2],
            ],
        },
        {
            name: "clamp-mirror",
            verticesArr: [
                [-0.5, 0.5, -0.3, 1.7],
                [-0.5, -0.5, -0.3, -0.2],
                [0.5, 0.5, 1.7, 1.7],
                [0.5, -0.5, 1.7, -0.2],
            ],
            callback: () => {
                const gl = ctx.gl;

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            },
        },
        {
            name: "repeat-T",
            verticesArr: [
                [-0.5, 0.5, -0.3, 1.7],
                [-0.5, -0.5, -0.3, -0.2],
                [0.5, 0.5, 1.7, 1.7],
                [0.5, -0.5, 1.7, -0.2],
            ],
            callback: () => {
                const gl = ctx.gl;
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            },
        },
        {
            name: "repeat-S",
            verticesArr: [
                [-0.5, 0.5, -0.3, 1.7],
                [-0.5, -0.5, -0.3, -0.2],
                [0.5, 0.5, 1.7, 1.7],
                [0.5, -0.5, 1.7, -0.2],
            ],
            callback: () => {
                const gl = ctx.gl;
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            },
        },
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
    .on("click", async (e, d) => {
        await ctx.loadTexture(u_Sampler, { url: "/assets/sky_cloud.jpg" });
        if (d.callback) {
            d.callback();
        }
        GLHelper.Hooks.Render.emit({ verticesArr: d.verticesArr });
    });
