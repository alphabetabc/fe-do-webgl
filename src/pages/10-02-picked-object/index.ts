import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { vertices, colors, indices } from "./data";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },

    uniforms: {
        u_MvpMatrix: {},
        u_Clicked: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Position"), vertices);
ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Color"), colors);

ctx.createElementArrayBuffer(indices);

const viewProjMatrix = new GLHelper.Math.Matrix4();
viewProjMatrix.setPerspective(30, ctx.width / ctx.height, 1, 100);
viewProjMatrix.lookAt(GLHelper.Math.Vector3.fromXYZ(0, 0, 17), GLHelper.Math.Vector3.fromXYZ(0, 0, 0), GLHelper.Math.Vector3.fromXYZ(0, 1, 0));

const mvpMatrix = new GLHelper.Math.Matrix4();

const u_Clicked = shader.getUniformLocation("u_Clicked");

const _state = {
    currentAngle: 0,
    step: 1,
};

const renderState = () => {
    GLHelper.Hooks.Render.emit(_state);
};

const check = (x: number, y: number) => {
    let picked = false;

    ctx.gl.uniform1i(u_Clicked, 1);
    renderState();

    const pixels = new Uint8Array(4);
    ctx.gl.readPixels(x, y, 1, 1, ctx.gl.RGBA, ctx.gl.UNSIGNED_BYTE, pixels);
    if (pixels[0] === 255) {
        picked = true;
    }

    ctx.gl.uniform1i(u_Clicked, 0);
    renderState();

    return picked;
};

const pickedResult = d3
    .select(ctx.container)
    .append("div")
    .attr(
        "style",
        `
            position: absolute;
            left: ${ctx.width + 10}px;
            top: 10px;
            background-color: #fff;
            width: 100px;
            height: 100px;
            color: #000;
            user-select: none;
        `,
    );

const rect = ctx.container.getBoundingClientRect();
d3.select(ctx.container).on("mousemove", (e) => {
    const { clientX, clientY } = e;

    if (GLHelper.Math.inRange(clientX, rect.left, rect.right) && GLHelper.Math.inRange(clientY, rect.top, rect.bottom)) {
        const x = clientX - rect.left;
        const y = rect.bottom - clientY;
        pickedResult.text(check(x, y) ? "picked" : "not picked");
    }
});

GLHelper.Hooks.Render.addEventListener((state) => {
    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.rotate(state.currentAngle, 1, 0, 0);
    mvpMatrix.rotate(state.currentAngle, 0, 1, 0);
    mvpMatrix.rotate(state.currentAngle, 0, 0, 1);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    ctx.clear();
    ctx.gl.drawElements(ctx.gl.TRIANGLES, indices.length, ctx.gl.UNSIGNED_BYTE, 0);
});

GLHelper.Hooks.Update.addEventListener(() => {
    _state.currentAngle += _state.step;
    _state.currentAngle = _state.currentAngle % 360;
    renderState();
});
