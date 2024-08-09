import * as d3 from "d3";
import { GLHelper } from "@utils";
import { toolbarForm, createFormGroup, updateFormValues } from "../../components/toolbar-ui";

import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Normal: {},
    },

    uniforms: {
        u_Color: {},

        u_MvpMatrix: {},
        u_LightColor: {},
        u_LightPosition: {},
        u_AmbientLight: {},
        u_NormalMatrix: {},
        u_ModelMatrix: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

// 灯光
ctx.gl.uniform3f(shader.getUniformLocation("u_LightColor"), 0.8, 0.8, 0.8);

// 环境光
ctx.gl.uniform3f(shader.getUniformLocation("u_AmbientLight"), 0.2, 0.2, 0.2);

const createVertexBuffer = (location: GLuint, vertices: Float32Array) => {
    const size = vertices.BYTES_PER_ELEMENT;
    ctx.createArrayBuffer(vertices);
    ctx.gl.vertexAttribPointer(location, 3, ctx.gl.FLOAT, false, 0, 0);
    ctx.gl.enableVertexAttribArray(location);
    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, null);
};

const createSphere = () => {
    const SPHERE_DIV = 6;
    const positions = [];
    const indices = [];

    // 生成位置数据
    for (let j = 0; j <= SPHERE_DIV; j++) {
        const aj = (j * Math.PI) / SPHERE_DIV;
        const sj = Math.sin(aj);
        const cj = Math.cos(aj);
        for (let i = 0; i <= SPHERE_DIV; i++) {
            const ai = (i * 2 * Math.PI) / SPHERE_DIV;
            const si = Math.sin(ai);
            const ci = Math.cos(ai);

            positions.push(
                si * sj, // X
                cj, // Y
                ci * sj, // Z
            );
        }
    }

    // 点
    // 生成位置数据
    for (let j = 0; j < SPHERE_DIV; j++) {
        for (let i = 0; i < SPHERE_DIV; i++) {
            const p1 = j * (SPHERE_DIV + 1) + i;
            const p2 = p1 + (SPHERE_DIV + 1);

            indices.push(p1, p2, p1 + 1);
            indices.push(p1 + 1, p2, p2 + 1);
        }
    }

    return { positions: new Float32Array(positions), indices: new Uint16Array(indices), indicesLength: indices.length };
};

const { indices, positions, indicesLength } = createSphere();

{
    createVertexBuffer(shader.getAttributeLocation("a_Position"), positions);
    createVertexBuffer(shader.getAttributeLocation("a_Normal"), positions);
    ctx.createElementArrayBuffer(indices);
}

{
    ctx.gl.uniform4f(shader.getUniformLocation("u_Color"), 1, 0, 0, 1);
}

/**
 * 顶点的个数
 */
const vertexCount = indicesLength;
console.log(vertexCount);

const modelMatrix = new GLHelper.Math.Matrix4();
const mvpMatrix = new GLHelper.Math.Matrix4();
const normalMatrix = new GLHelper.Math.Matrix4();

GLHelper.Hooks.Render.addEventListener((d) => {
    // 点光源的位置
    ctx.gl.uniform3f(shader.getUniformLocation("u_LightPosition"), d.pointLightX, d.pointLightY, d.pointLightZ);

    mvpMatrix.setPerspective(d.fovY, ctx.width / ctx.height, d.near, d.far);
    mvpMatrix.lookAt(
        GLHelper.Math.Vector3.fromXYZ(d.eyeX, d.eyeY, d.eyeZ),
        GLHelper.Math.Vector3.fromXYZ(0, 0, 0),
        GLHelper.Math.Vector3.fromXYZ(0, 1, 0),
    );

    modelMatrix.setTranslate(d.tx, d.ty, d.tz); // 平移
    modelMatrix.rotate(d.angle, 0, 1, 0); // 旋转
    mvpMatrix.multiply(modelMatrix);
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

    // 根据模型矩阵来计算变换法向量矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    ctx.uniformMatrix4fv(shader.getUniformLocation("u_NormalMatrix"), normalMatrix);

    ctx.uniformMatrix4fv(shader.getUniformLocation("u_ModelMatrix"), modelMatrix);

    ctx.clear();
    /**
     * 绘制图形
     * 指定顶点的个数 count
     * -- 绘制的模式为 gl.UNSIGNED_SHORT
     */
    ctx.gl.drawElements(ctx.gl.TRIANGLES, vertexCount, ctx.gl.UNSIGNED_SHORT, 0);
});

toolbarForm.on("change", (e) => {
    const formData = new FormData(toolbarForm.node());
    const obj = {};
    Array.from(formData.entries(), (entry) => {
        const [key, value] = entry;
        const [, prop] = key.split(":");

        obj[prop] = Number(value) ?? 0;
    });

    GLHelper.Hooks.Render.emit(obj);
});

createFormGroup("透视相机参数", [
    { name: "fovY", value: 30.0 },
    { name: "near", value: 0.1 },
    { name: "far", value: 100.0 },
]);

createFormGroup("视点参数", [
    { name: "eyeX", value: 0 },
    { name: "eyeY", value: 0 },
    { name: "eyeZ", value: 10 },
]);

createFormGroup("模型矩阵控制", [
    { name: "angle", value: 0 },
    { name: "tx", value: 0 },
    { name: "ty", value: 1 },
    { name: "tz", value: 0 },
]);

createFormGroup("点光源的位置", [
    { name: "pointLightX", value: 5 },
    { name: "pointLightY", value: 8 },
    { name: "pointLightZ", value: 7 },
]);

let i = 0;
GLHelper.Hooks.Update.addEventListener(() => {
    if (i > 360) {
        i = 0;
    } else {
        i += 1;
    }
    updateFormValues({ angle: i });
});

toolbarForm.dispatch("change");
