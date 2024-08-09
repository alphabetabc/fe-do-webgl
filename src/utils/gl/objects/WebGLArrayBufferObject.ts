import { type GLHelper_WebGLAttribLocation } from "../types";
import { type WebGLRendererContext } from "../WebGLRendererContext";

class WebGLArrayBufferObject {
    constructor(rendererContext: WebGLRendererContext, data?: AllowSharedBufferSource) {
        this.#ctx.rendererContext = rendererContext;
        this.#ctx.gl = rendererContext.gl;

        if (data) {
            this.createBuffer(data);
            this.#ctx.data = data;
        }
    }

    #ctx = {
        gl: null as WebGLRenderingContext,
        buffer: null as WebGLBuffer,
        rendererContext: null as WebGLRendererContext,
        data: null as AllowSharedBufferSource,
    };

    get buffer() {
        return this.#ctx.buffer;
    }

    /**
     * 创建缓冲区
     */
    createBuffer = (data: AllowSharedBufferSource) => {
        this.#ctx.buffer = this.#ctx.rendererContext.createArrayBuffer(data);
    };

    /**
     * 绑定缓冲区
     */
    bindBuffer = () => {
        const { gl, buffer } = this.#ctx;
        if (buffer === null) {
            throw new Error("buffer is null");
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    };

    /**
     * 启用顶点属性
     * @param location 顶点属性位置
     * @param config.size 数据大小 --- vertexAttribPointer
     * @param config.type 数据类型 --- vertexAttribPointer
     * @param config.stride 步长 --- vertexAttribPointer
     * @param config.offset 偏移 --- vertexAttribPointer
     */
    useBuffer = (location: GLHelper_WebGLAttribLocation, config?: { type?: GLenum; size?: GLint; stride?: GLsizei; offset?: GLintptr }) => {
        const { gl } = this.#ctx;
        const { type, size = 3, stride = 0, offset = 0 } = config ?? {};
        this.bindBuffer();
        gl.vertexAttribPointer(location, size, type ?? gl.FLOAT, false, stride, offset);
        gl.enableVertexAttribArray(location);
    };

    /**
     *  创建启用顶点属性的执行器
     */
    createUseBufferExecutor = (...args: Parameters<WebGLArrayBufferObject["useBuffer"]>) => {
        return () => this.useBuffer(...args);
    };

    /**
     * 解绑缓冲区
     */
    unBindBuffer = () => {
        this.#ctx.buffer = null;
    };
}

export {
    //
    WebGLArrayBufferObject,
};
