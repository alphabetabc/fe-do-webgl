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
        u_Sampler_FG: {},
        u_Sampler_BG: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const a_Position = shader.getAttributeLocation("a_Position");
const a_TexCoord = shader.getAttributeLocation("a_TexCoord");
const u_Sampler_BG = shader.getUniformLocation("u_Sampler_BG");
const u_Sampler_FG = shader.getUniformLocation("u_Sampler_FG");

GLHelper.Hooks.Render.addEventListener((d) => {
    const vertices = new Float32Array(d.verticesArr.flat());
    ctx.createBuffer(vertices);

    const size = vertices.BYTES_PER_ELEMENT;

    ctx.gl.vertexAttribPointer(a_Position, 2, ctx.gl.FLOAT, false, 4 * size, 0 * size);
    ctx.gl.enableVertexAttribArray(a_Position);

    ctx.gl.vertexAttribPointer(a_TexCoord, 2, ctx.gl.FLOAT, false, 4 * size, 2 * size);
    ctx.gl.enableVertexAttribArray(a_TexCoord);

    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLE_STRIP, 0, vertices.length);
});

await ctx.loadTexture(u_Sampler_BG, { url: "/assets/sky_cloud.jpg", activeTexture: ctx.gl.TEXTURE0, textureUnit: 0 });
await ctx.loadTexture(u_Sampler_FG, { url: "/assets/circle.gif", activeTexture: ctx.gl.TEXTURE1, textureUnit: 1 });

GLHelper.Hooks.Render.emit({
    verticesArr: [
        [-0.5, 0.5, 0.0, 1.0],
        [-0.5, -0.5, 0.0, 0.0],
        [0.5, 0.5, 1.0, 1.0],
        [0.5, -0.5, 1.0, 0.0],
    ],
});
