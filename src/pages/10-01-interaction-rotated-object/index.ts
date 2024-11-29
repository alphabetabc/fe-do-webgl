import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { vertices, texCoords, indices } from "./data";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_TexCoord: {},
    },

    uniforms: {
        u_MvpMatrix: {},
        u_Sampler: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Position"), vertices);
ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_TexCoord"), texCoords, 2);
ctx.createElementArrayBuffer(indices);

const viewProjMatrix = new GLHelper.Math.Matrix4();
viewProjMatrix.setPerspective(30, ctx.width / ctx.height, 1, 100);
viewProjMatrix.lookAt(GLHelper.Math.Vector3.fromXYZ(3, 3, 7), GLHelper.Math.Vector3.fromXYZ(0, 0, 0), GLHelper.Math.Vector3.fromXYZ(0, 1, 0));

const mvpMatrix = new GLHelper.Math.Matrix4();

const state = {
    rotateX: 0,
    rotateY: 0,

    mouseX: -1,
    mouseY: -1,
    enableMove: false,
};

GLHelper.Hooks.Render.addEventListener((d) => {
    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.rotate(d.rotateX, 1, 0, 0); // x轴
    mvpMatrix.rotate(d.rotateY, 0, 1, 0); // y轴

    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    ctx.clear();
    ctx.gl.drawElements(ctx.gl.TRIANGLES, indices.length, ctx.gl.UNSIGNED_BYTE, 0);
});

await ctx.loadTexture(shader.getUniformLocation("u_Sampler"), { url: "/assets/sky.jpg" });
GLHelper.Hooks.Render.emit(state);

d3.select(document.documentElement).on("mouseup", () => {
    state.enableMove = false;
});

const angleUnitHeight = 360 / ctx.height;

d3.select(ctx.container)
    .on("mousedown", (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const rect = ctx.container.getBoundingClientRect();
        if (GLHelper.Math.inRange(x, rect.left, rect.right) && GLHelper.Math.inRange(y, rect.top, rect.bottom)) {
            state.enableMove = true;
            state.mouseX = x;
            state.mouseY = y;
        }
    })
    .on("mousemove", (e) => {
        const x = e.clientX;
        const y = e.clientY;
        if (state.enableMove) {
            const dx = angleUnitHeight * (x - state.mouseX);
            const dy = angleUnitHeight * (y - state.mouseY);

            state.rotateX = Math.max(-90, Math.min(90, state.rotateX + dy));
            state.rotateY += dx;

            GLHelper.Hooks.Render.emit(state);
        }

        state.mouseX = x;
        state.mouseY = y;
    });
