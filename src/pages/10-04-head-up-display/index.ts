import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { vertices, colors, indices } from "./data";

const root = d3.select(GLHelper.Dom.getContainer());
root.append("style").html(`
    #gl-container{
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        z-index: 0;
    }

    #hud-container{
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        z-index: 1;
    }

    #picked-result{
        position: absolute;
        top: 10px;
        background-color: #fff;
        width: 100px;
        height: 100px;
        color: #000;
        user-select: none;
    }
`);
const d3GLContainer = root.append("div").attr("id", "gl-container");
const ctx2d = GLHelper.initContext2d(root.append("div").attr("id", "hud-container").node());
const pickedResult = root.append("div").attr("id", "picked-result");

console.log(ctx2d);

const ctx = GLHelper.createWebGLRendererContext(d3GLContainer.node());

pickedResult.style("left", `${ctx.width + 10}px`);

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

const draw2d = (ctx: any, state: any) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.moveTo(120, 10);
    ctx.lineTo(200, 150);
    ctx.lineTo(40, 150);
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.stroke();

    // Draw white letters
    ctx.font = '18px "Times New Roman"';
    ctx.fillStyle = "rgba(255, 255, 255, 1)"; // Set white to the color of letters
    ctx.fillText("HUD: Head Up Display", 40, 180);
    ctx.fillText("Triangle is drawn by Canvas 2D API.", 40, 200);
    ctx.fillText("Cube is drawn by WebGL API.", 40, 220);
    ctx.fillText("Current Angle: " + Math.floor(state.currentAngle), 40, 240);
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

const rect = ctx.container.getBoundingClientRect();
d3.select(ctx2d.canvas).on("mousemove", (e) => {
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

    ctx.clear({ a: 0 });
    ctx.gl.drawElements(ctx.gl.TRIANGLES, indices.length, ctx.gl.UNSIGNED_BYTE, 0);

    ctx2d.call(draw2d, _state);
});

GLHelper.Hooks.Update.addEventListener(() => {
    _state.currentAngle += _state.step;
    _state.currentAngle = _state.currentAngle % 360;
    renderState();
});
