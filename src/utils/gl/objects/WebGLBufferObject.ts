import { GLHelper_WebGLAttribLocation } from "../types";
import { type WebGLRendererContext } from "../WebGLRendererContext";

type TWebGLBufferObjectConfig = Partial<{
    data: AllowSharedBufferSource;
    usage: GLenum;
}> & { target: GLenum };

/**
 * WebGLBufferObject
 */
class WebGLBufferObject {
    constructor(rendererContext: WebGLRendererContext, config?: TWebGLBufferObjectConfig) {
        this.#ctx.rendererContext = rendererContext;
        this.#ctx.gl = rendererContext.gl;
        this.#ctx.target = config?.target ?? null;
        this.#ctx.data = config?.data ?? null;

        this.createBuffer();
        if (this.#ctx.data) {
            this.bufferData(this.#ctx.data, config.usage);
        }
    }

    #ctx = {
        gl: null as WebGLRenderingContext,
        buffer: null as WebGLBuffer,
        rendererContext: null as WebGLRendererContext,
        data: null as AllowSharedBufferSource,
        target: null as GLenum,
    };

    get buffer() {
        return this.#ctx.buffer;
    }

    createBuffer = () => {
        const gl = this.#ctx.gl;
        const buffer = gl.createBuffer();
        if (!buffer) {
            throw new Error("Failed to create buffer object");
        }
        this.#ctx.buffer = buffer;
    };

    bindBuffer = () => {
        const { gl, buffer, target } = this.#ctx;
        if (buffer === null) {
            throw new Error("buffer is null");
        }
        gl.bindBuffer(target, buffer);
    };

    bufferData = (data: AllowSharedBufferSource, usage: GLenum) => {
        this.#ctx.data = data;
        if (this.#ctx.buffer === null || this.#ctx.target === null) {
            throw new Error("buffer or target is null");
        }
        this.bindBuffer();
        this.#ctx.gl.bufferData(this.#ctx.target, data, usage);
    };

    /**
     * 启用顶点属性
     * @param location 顶点属性位置
     * @param config.size 数据大小，默认为3 --- vertexAttribPointer
     * @param config.type 数据类型,默认为gl.Float --- vertexAttribPointer
     * @param config.stride 步长，默认为0 --- vertexAttribPointer
     * @param config.offset 偏移，默认为0 --- vertexAttribPointer
     */
    useBuffer = (location: GLHelper_WebGLAttribLocation, config?: { type?: GLenum; size?: GLint; stride?: GLsizei; offset?: GLintptr }) => {
        const { gl } = this.#ctx;
        const { type, size = 3, stride = 0, offset = 0 } = config ?? {};
        this.bindBuffer();

        gl.vertexAttribPointer(location, size, type ?? gl.FLOAT, false, stride, offset);
        gl.enableVertexAttribArray(location);
    };

    /**
     * 解绑缓冲区
     */
    unBindBuffer = () => {
        this.#ctx.buffer = null;
        this.#ctx.gl.bindBuffer(this.#ctx.target, null);
    };
}

export {
    //
    WebGLBufferObject,
    type TWebGLBufferObjectConfig,
};
