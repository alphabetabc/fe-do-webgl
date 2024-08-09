import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const container = GLHelper.Dom.getContainer();
GLHelper.Dom.setStyle(container, {
    // width: "400px",
    // height: "400px",
});

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },

    uniforms: {
        u_ViewMatrix: {},
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

GLHelper.Hooks.Render.addEventListener((d) => {
    const viewMatrix = new GLHelper.Math.Matrix4();
    viewMatrix.setLookAt(
        GLHelper.Math.Vector3.create([d.eye.x, d.eye.y, d.eye.z]),
        GLHelper.Math.Vector3.create([d.center.x, d.center.y, d.center.z]),
        GLHelper.Math.Vector3.create([d.up.x, d.up.y, d.up.z]),
    );
    const u_ViewMatrix = shader.getUniformLocation("u_ViewMatrix");
    ctx.gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, verticesArr.length);
});

const toolbar = d3.select("#toolbar");
GLHelper.Dom.setStyle(toolbar.node() as any, {
    left: "880px",
    top: "50px",
});

const form = toolbar
    .append("form")
    .on("submit", (e) => {
        e.preventDefault();
    })
    .on("change", (e) => {
        const formData = new FormData(form.node());
        const obj = {};
        Array.from(formData.entries(), (entry) => {
            const [key, value] = entry;
            const [group, prop] = key.split(":");
            obj[group] = obj[group] || {};
            obj[group][prop] = Number(value) ?? 0;
        });

        GLHelper.Hooks.Render.emit(obj);
    });

const createFormGroup = (groupName: string, data: { name: string; value: any }[]) => {
    const group = form.append("div").attr("class", "group").style("margin-bottom", "10px").style("outline", "1px dashed").style("padding", "5px");

    group.append("div").text(groupName);

    group
        .selectAll(".label-item")
        .data(data.map((d) => ({ ...d, formId: `${groupName}:${d.name}` })))
        .join("label")
        .attr("class", "label-item")
        .attr("for", (d) => d.formId)
        .html((d) => d.name)
        .style("display", "block")
        .append("input")
        .attr("type", "number")
        .attr("id", (d) => d.formId)
        .attr("name", (d) => d.formId)
        .attr("value", (d) => d.value)
        .attr("step", 0.01)
        .style("margin-left", "5px");
};

/**
 * 在webgl中，观察者的默认状态应该是
 * - 观察者位于世界坐标系的原点 0,0,0
 * - 观察者朝向世界坐标系的负z轴 (0,0,-1)
 * - 观察者观察上方向 (0,1,0)
 */
createFormGroup("eye", [
    { name: "x", value: 0 },
    { name: "y", value: 0 },
    { name: "z", value: 0 },
]);

createFormGroup("center", [
    { name: "x", value: 0.0 },
    { name: "y", value: 0.0 },
    { name: "z", value: -1.0 },
]);

createFormGroup("up", [
    { name: "x", value: 0 },
    { name: "y", value: 1 },
    { name: "z", value: 0 },
]);

form.dispatch("change");
