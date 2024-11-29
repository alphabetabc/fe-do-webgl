import { WebGLRendererContext } from "../WebGLRendererContext";

/**
 * 索引缓冲区对象
 */
class WebGLElementArrayBufferObject {
    constructor(rendererContext: WebGLRendererContext, data?: AllowSharedBufferSource) {
        this.#ctx.rendererContext = rendererContext;
        this.#ctx.gl = rendererContext.gl;

        if (data) {
            this.createBuffer(data);
        }
    }

    #ctx = {
        gl: null as WebGLRenderingContext,
        buffer: null as WebGLBuffer,
        rendererContext: null as WebGLRendererContext,
        data: null as AllowSharedBufferSource,
        length: 0,
    };

    /**
     * 索引长度
     */
    get indexLength() {
        return this.#ctx.length;
    }

    createBuffer = (data: AllowSharedBufferSource) => {
        this.#ctx.buffer = this.#ctx.rendererContext.createElementArrayBuffer(data);
        this.#ctx.data = data;
        // @ts-ignore
        this.#ctx.length = data.length ?? data.byteLength;
    };

    bindBuffer = () => {
        const { gl, buffer } = this.#ctx;
        if (buffer === null) {
            throw new Error("buffer is null");
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    };

    useBuffer = () => {
        this.bindBuffer();
    };

    createUseBufferExecutor = () => {
        return () => this.useBuffer();
    };

    unBindBuffer = () => {
        this.#ctx.buffer = null;
    };
}

export {
    //
    WebGLElementArrayBufferObject,
};
