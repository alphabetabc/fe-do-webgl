import * as d3 from "d3";
import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";
import { vertices, colors, indices, faces } from "./data";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

const { shader } = ctx.createShaderProgram({
    attributes: {
        a_Position: {},
        a_Color: {},
        a_Face: {},
    },

    uniforms: {
        u_MvpMatrix: {},
        u_PickedFace: {},
    },

    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
});

/**
 * 顶点缓冲区对象采用的是Float32Array，并且size为3.
 */
ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Position"), vertices);
ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Color"), colors);

/**
 * ******** 注意这块啊***************
 * 面索引创建的时候使用的无符号的索引缓冲区对象，并且size为1.
 */
const faceBufferObject = ctx.createArrayBufferObject(faces);
faceBufferObject.useBuffer(shader.getAttributeLocation("a_Face"), {
    type: ctx.gl.UNSIGNED_BYTE,
    size: 1,
});

ctx.createElementArrayBuffer(indices);

const u_PickedFace = shader.getUniformLocation("u_PickedFace");
// 初始化选择的面
ctx.gl.uniform1i(u_PickedFace, -1);

const viewProjMatrix = new GLHelper.Math.Matrix4();
viewProjMatrix.setPerspective(30, ctx.width / ctx.height, 1, 100);
viewProjMatrix.lookAt(GLHelper.Math.Vector3.fromXYZ(0, 0, 17), GLHelper.Math.Vector3.fromXYZ(0, 0, 0), GLHelper.Math.Vector3.fromXYZ(0, 1, 0));

const mvpMatrix = new GLHelper.Math.Matrix4();

const _state = {
    currentAngle: 0,
    step: 1,
};

const renderState = () => {
    GLHelper.Hooks.Render.emit(_state);
};

const checkFace = (x: number, y: number) => {
    let picked = false;

    // 存储像素值的数组
    const pixels = new Uint8Array(4);

    // 将表面编号写入α分量
    ctx.gl.uniform1i(u_PickedFace, 0);
    renderState();

    // 读取（x,y）处的颜色，pixels[3]中存储了表面的编号
    ctx.gl.readPixels(x, y, 1, 1, ctx.gl.RGBA, ctx.gl.UNSIGNED_BYTE, pixels);

    /**
     * 在顶点着色器中，将当前的面的索引写入了颜色的alpha值中
     * 然后读取颜色的alpha值来获取当前的面索引
     */
    const faceIndex = pixels[3];

    if (GLHelper.Math.inRange(faceIndex, 1, 6)) {
        picked = true;
    }

    ctx.gl.uniform1i(u_PickedFace, faceIndex);
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

    if (GLHelper.Math.inRect({ x: clientX, y: clientY }, rect)) {
        const x = clientX - rect.left;
        const y = rect.bottom - clientY;
        pickedResult.text(checkFace(x, y) ? "picked" : "not picked");
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
