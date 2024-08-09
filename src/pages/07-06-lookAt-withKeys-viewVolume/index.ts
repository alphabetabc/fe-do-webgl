import * as d3 from "d3";
import { GLHelper } from "@utils";

import { toolbarForm, createFormGroup, toolbar, updateFormValues } from "../../components/toolbar-ui";

import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },

    uniforms: {
        u_ModelViewMatrix: {},
        u_ProjMatrix: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

const verticesArr = [
    // 顶点和颜色
    // 绿色三角形 最后面
    [0.0, 0.5, -0.4, 0.4, 1.0, 0.4],
    [-0.5, -0.5, -0.4, 0.4, 1.0, 0.4],
    [0.5, -0.5, -0.4, 1.0, 0.4, 0.4],

    // 黄色三角形 中间
    [0.5, 0.4, -0.2, 1.0, 0.4, 0.4],
    [-0.5, 0.4, -0.2, 1.0, 1.0, 0.4],
    [0.0, -0.6, -0.2, 1.0, 1.0, 0.4],

    // 蓝色三角形 最前面
    [0.0, 0.5, 0.0, 0.4, 0.4, 1.0],
    [-0.5, -0.5, 0.0, 0.4, 0.4, 1.0],
    [0.5, -0.5, 0.0, 1.0, 0.4, 0.4],
];

const vertices = new Float32Array(verticesArr.flat());

const size = vertices.BYTES_PER_ELEMENT;

{
    ctx.createBuffer(vertices);
    const a_Position = shader.getAttributeLocation("a_Position");
    ctx.gl.vertexAttribPointer(a_Position, 3, ctx.gl.FLOAT, false, 6 * size, 0 * size);
    ctx.gl.enableVertexAttribArray(a_Position);

    const a_Color = shader.getAttributeLocation("a_Color");
    ctx.gl.vertexAttribPointer(a_Color, 3, ctx.gl.FLOAT, false, 6 * size, 3 * size);
    ctx.gl.enableVertexAttribArray(a_Color);
}

const viewMatrix = new GLHelper.Math.Matrix4();
const modelMatrix = new GLHelper.Math.Matrix4();
const projMatrix = new GLHelper.Math.Matrix4();

GLHelper.Hooks.Render.addEventListener((d) => {
    viewMatrix.setLookAt(d.eye, d.center, d.up);
    modelMatrix.setRotate(d.rotate ?? 0, 0, 0, 1);

    const mvMatrix = viewMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_ModelViewMatrix"), mvMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_ProjMatrix"), projMatrix);

    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, verticesArr.length);
});

let eyeX = 0;
GLHelper.Hooks.Render.emit({
    eye: GLHelper.Math.Vector3.create([eyeX, 0.25, 0.25]),
    center: GLHelper.Math.Vector3.create([0, 0, 0]),
    up: GLHelper.Math.Vector3.create([0, 1, 0]),
});

document.documentElement.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") {
        console.log(" eyeX += 0.01");
        eyeX += 0.01;
    } else if (e.code === "ArrowLeft") {
        console.log(" eyeX -= 0.01");
        eyeX -= 0.01;
    } else {
        return;
    }

    GLHelper.Hooks.Render.emit({
        eye: GLHelper.Math.Vector3.create([eyeX, 0.25, 0.25]),
        center: GLHelper.Math.Vector3.create([0, 0, 0]),
        up: GLHelper.Math.Vector3.create([0, 1, 0]),
    });
});

toolbarForm.on("change", (e, d) => {
    const obj = e.detail ?? ({} as any);

    if (!e.detail) {
        const formData = new FormData(toolbarForm.node());
        Array.from(formData.entries(), (entry) => {
            const [key, value] = entry;
            const [, prop] = key.split(":");
            obj[prop] = Number(value) ?? 0;
        });
        console.log("log---------------", obj);
    }

    projMatrix.setOrtho(obj.left, obj.right, obj.bottom, obj.top, obj.near, obj.far);

    GLHelper.Hooks.Render.emit({
        eye: GLHelper.Math.Vector3.create([eyeX, 0.25, 0.25]),
        center: GLHelper.Math.Vector3.create([0, 0, 0]),
        up: GLHelper.Math.Vector3.create([0, 1.0, 0]),
    });
});

const { group } = createFormGroup("正交相机参数", [
    { name: "left", value: -1.0 },
    { name: "right", value: 1.0 },
    { name: "bottom", value: -1.0 },
    { name: "top", value: 1.0 },
    { name: "near", value: 0.0 },
    { name: "far", value: 2.0 },
]);

console.log(group);

group.selectAll(".label-text").style("width", "60px").style("text-align", "right");
toolbarForm.dispatch("change");

toolbar
    .append("div")
    .append("button")
    .text("近距离")
    .on("click", () => {
        updateFormValues({ left: -0.5, right: 0.5, bottom: -0.5, top: 0.5, near: 0.0, far: 0.5 });
    });

toolbar
    .append("div")
    .append("button")
    .text("half-width")
    .on("click", () => {
        updateFormValues({ left: -0.3, right: 0.3, bottom: -1.0, top: 1.0, near: 0.0, far: 0.5 });
    });

toolbar
    .append("div")
    .append("button")
    .text("reset")
    .on("click", () => {
        updateFormValues({ left: -1, right: 1, bottom: -1, top: 1, near: 0, far: 2 });
    });

toolbar
    .append("div")
    .append("button")
    .text("使用表单数据")
    .on("click", () => {
        toolbarForm.dispatch("change");
    });
