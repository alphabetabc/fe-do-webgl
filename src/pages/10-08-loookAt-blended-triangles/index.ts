import { GLHelper } from "@utils";
import { toolbarForm, createFormGroup, createFormGroupSelect, getToolbarFormDataObj } from "../../components/toolbar-ui";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());
const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
    },
    uniforms: {
        u_MvpMatrix: {},
    },

    vertexShader: `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 u_MvpMatrix;
        varying vec4 v_Color;
        void main() {
            gl_Position = u_MvpMatrix * a_Position;
            v_Color = a_Color;
        }
    `,
    fragmentShader: `
        varying vec4 v_Color;
        void main() {
            gl_FragColor = v_Color;
        }
    `,
});

const verticesColors = new Float32Array(
    [
        // Vertex coordinates and color(RGBA)
        [0.0, 0.5, -0.4, 0.4, 1.0, 0.4, 0.4], // The back green one
        [-0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 0.4],
        [0.5, -0.5, -0.4, 1.0, 0.4, 0.4, 0.4],

        [0.5, 0.4, -0.2, 1.0, 0.4, 0.4, 0.4], // The middle yerrow one
        [-0.5, 0.4, -0.2, 1.0, 1.0, 0.4, 0.4],
        [0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 0.4],

        [0.0, 0.5, 0.0, 0.4, 0.4, 1.0, 0.4], // The front blue one
        [-0.5, -0.5, 0.0, 0.4, 0.4, 1.0, 0.4],
        [0.5, -0.5, 0.0, 1.0, 0.4, 0.4, 0.4],
    ].flat(),
);

const offset = 7;
const n = verticesColors.length / offset;
const size = verticesColors.BYTES_PER_ELEMENT;

const { useBuffer } = ctx.createArrayBufferObject(verticesColors);
useBuffer(shader.getAttributeLocation("a_Position"), { size: 3, stride: size * offset, offset: 0 });
useBuffer(shader.getAttributeLocation("a_Color"), { size: 4, stride: size * offset, offset: size * 3 });
ctx.unBindArrayBuffer();

const mvpMatrix = new GLHelper.Math.Matrix4();
const projMatrix = new GLHelper.Math.Matrix4();
const viewMatrix = new GLHelper.Math.Matrix4();

projMatrix.setOrtho(-1, 1, -1, 1, 0, 2);

const blendFuncList = [
    { name: "ZERO", value: ctx.gl.ZERO },
    { name: "ONE", value: ctx.gl.ONE },
    { name: "SRC_COLOR", value: ctx.gl.SRC_COLOR },
    { name: "ONE_MINUS_SRC_COLOR", value: ctx.gl.ONE_MINUS_SRC_COLOR },
    { name: "DST_COLOR", value: ctx.gl.DST_COLOR },
    { name: "ONE_MINUS_DST_COLOR", value: ctx.gl.ONE_MINUS_DST_COLOR },
    { name: "SRC_ALPHA", value: ctx.gl.SRC_ALPHA },
    { name: "ONE_MINUS_SRC_ALPHA", value: ctx.gl.ONE_MINUS_SRC_ALPHA },
    { name: "DST_ALPHA", value: ctx.gl.DST_ALPHA },
    { name: "ONE_MINUS_DST_ALPHA", value: ctx.gl.ONE_MINUS_DST_ALPHA },
    { name: "SRC_ALPHA_SATURATE", value: ctx.gl.SRC_ALPHA_SATURATE },
];

const state = {
    eyeX: 0.2,
    eyeY: 0.25,
    eyeZ: 0.25,
};

GLHelper.Hooks.Render.addEventListener((state) => {
    // ctx.blend.enable(state.sfactor, state.dFactor);
    ctx.blend.enable();
    viewMatrix.setLookAt(
        GLHelper.Math.Vector3.create([state.eyeX, state.eyeY, state.eyeZ]),
        GLHelper.Math.Vector3.create([0, 0, 0]),
        GLHelper.Math.Vector3.create([0, 1, 0]),
    );

    mvpMatrix.set(projMatrix).multiply(viewMatrix);

    ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);
    ctx.clear();
    ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, n);
});

createFormGroup("eye", [
    { name: "eyeX", value: state.eyeX },
    { name: "eyeY", value: state.eyeY },
    { name: "eyeZ", value: state.eyeZ },
]);

createFormGroupSelect("blendFunc", [
    { name: "sfactor", value: blendFuncList[6].value, options: blendFuncList },
    { name: "dFactor", value: blendFuncList[7].value, options: blendFuncList },
]);

toolbarForm.on("change", () => {
    const obj = {};
    Object.entries(getToolbarFormDataObj()).forEach(([key, value]) => {
        const formKey = key.split(":")[1];
        obj[formKey] = Number(value);
    });

    GLHelper.Hooks.Render.emit(obj);
});

toolbarForm.dispatch("change");
