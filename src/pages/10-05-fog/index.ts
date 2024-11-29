///
// 线性雾化
///

import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { vertices, colors, indices } from "./data";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());
const d3Container = d3.select(ctx.container);

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },
    uniforms: {
        u_MvpMatrix: {},
        u_ModelMatrix: {},
        u_Eye: {},
        u_FogColor: {},
        u_FogDist: {},
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Position"), vertices);
ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Color"), colors);

ctx.createElementArrayBuffer(indices);

const fogColor = new Float32Array([0.137, 0.231, 0.423]);
const fogDist = new Float32Array([50.0, 120.0]);
const eye = new Float32Array([25, 65, 35, 1.0]);

ctx.gl.uniform3fv(shader.getUniformLocation("u_FogColor"), fogColor);
ctx.gl.uniform2fv(shader.getUniformLocation("u_FogDist"), fogDist);
ctx.gl.uniform4fv(shader.getUniformLocation("u_Eye"), eye);

const modelMatrix = new GLHelper.Math.Matrix4();
modelMatrix.setScale(10, 10, 10);
ctx.uniformMatrix4fv(shader.getUniformLocation("u_ModelMatrix"), modelMatrix);

const viewProjMatrix = new GLHelper.Math.Matrix4();
viewProjMatrix.setPerspective(30, ctx.width / ctx.height, 1, 1000);
viewProjMatrix.lookAt(
    GLHelper.Math.Vector3.fromXYZ(eye[0], eye[1], eye[2]),
    GLHelper.Math.Vector3.fromXYZ(0, 2, 0),
    GLHelper.Math.Vector3.fromXYZ(0, 1, 0),
);
viewProjMatrix.multiply(modelMatrix);

const mvpMatrix = new GLHelper.Math.Matrix4();

const _state = {
    currentAngle: 0,
    step: 1,
    fogDistNear: fogDist[0],
    fogDistFar: fogDist[1],
    fogDistFactor: 0,
};

const infoRoot = d3Container.append("div").attr("class", "info").style("position", "absolute");
const info = infoRoot.append("div");
GLHelper.Dom.setStyle(infoRoot.node(), {
    left: "820px",
    top: "10px",
    color: "white",
    fontSize: "14px",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
});
infoRoot.append("style").html(`
    .info-item{
        width: 200px;
        white-space: nowrap;
    }
`);

const renderState = () => {
    GLHelper.Hooks.Render.emit(_state);
};

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
    _state.fogDistFactor += GLHelper.Math.angle.degree * 0.01;
    _state.fogDistFactor = _state.fogDistFactor % 180;
    fogDist[1] = Math.sin(GLHelper.Math.toRadian(_state.fogDistFactor)) * (_state.fogDistFar - _state.fogDistNear) + _state.fogDistNear;
    ctx.gl.uniform2fv(shader.getUniformLocation("u_FogDist"), fogDist);

    info.html(`
        <div class="info-item">fogDistNear: ${_state.fogDistNear}</div>
        <div class="info-item">fogDistFar: ${_state.fogDistFar}</div>
        <div class="info-item">fogDist: ${fogDist[1]}</div>
    `);

    renderState();
});
