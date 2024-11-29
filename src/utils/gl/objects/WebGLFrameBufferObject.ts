import { WebGLRendererContext } from "../WebGLRendererContext";

type WebGLFramebufferObjectConfig = Partial<{
    width: number;
    height: number;

    /**
     * 是否使用帧缓冲区
     * @default true
     */
    useFrameBuffer: boolean;
}>;

/**
 * 帧缓冲区对象
 * - 这个对象很复杂
 * - `useFrameBuffer` 之后，
 *      - 通过 `obj.bindFramebuffer` 将纹理对象关联到帧缓冲区对象，
 *      - 通过 `obj.unbindFramebuffer` 将纹理对象与帧缓冲区对象解除关联
 */
class WebGLFramebufferObject {
    constructor(rendererContext: WebGLRendererContext, config: WebGLFramebufferObjectConfig) {
        this.#ctx.rendererContext = rendererContext;
        this.#ctx.gl = rendererContext.gl;
        this.createFramebufferObject(config);
    }

    #ctx = {
        gl: null as WebGLRenderingContext,
        rendererContext: null as WebGLRendererContext,

        framebuffer: null as WebGLFramebuffer,
        texture: null as WebGLTexture,
        depthBuffer: null as WebGLRenderbuffer,

        useFramebuffer: false,
    };

    #status = {
        // 绑定纹理对象状态
        boundBuffer: false,
    };

    get framebuffer() {
        return this.#ctx.framebuffer;
    }

    get texture() {
        return this.#ctx.texture;
    }

    get isBoundBuffer() {
        return this.#status.boundBuffer;
    }

    throwErr = (message: string) => {
        const gl = this.#ctx.gl;
        if (this.#ctx.framebuffer) {
            gl.deleteFramebuffer(this.#ctx.framebuffer);
        }

        if (this.#ctx.texture) {
            gl.deleteTexture(this.#ctx.texture);
        }

        if (this.#ctx.depthBuffer) {
            gl.deleteRenderbuffer(this.#ctx.depthBuffer);
        }

        throw new Error(`[创建帧缓冲区失败]:  ${message ?? "unknown"}`);
    };

    createFramebuffer = () => {
        // 1-创建帧缓冲区对象
        const framebuffer = this.#ctx.gl.createFramebuffer();
        this.#ctx.framebuffer = framebuffer;
        if (!framebuffer) {
            this.throwErr("framebuffer");
        }
    };

    createTexture = (config?: Partial<{ width: number; height: number }>) => {
        // 2-创建纹理对象，并设置尺寸和参数
        const gl = this.#ctx.gl;
        const texture = gl.createTexture();
        this.#ctx.texture = texture;

        if (!texture) {
            this.throwErr("texture");
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, config.width ?? 512, config.height ?? 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };

    createRenderBuffer = (config?: Partial<{ width: number; height: number }>) => {
        // 3-创建渲染缓冲区对象并设置其尺寸和参数
        const gl = this.#ctx.gl;
        const depthBuffer = gl.createRenderbuffer();
        this.#ctx.depthBuffer = depthBuffer;

        if (!depthBuffer) {
            this.throwErr("depthBuffer");
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, config.width ?? 512, config.height ?? 512);
    };

    useFramebuffer = () => {
        // 4-将渲染缓冲区对象关联到帧缓冲区对象
        const gl = this.#ctx.gl;

        // 绑定帧缓冲区
        this.bindFramebuffer();

        // 将纹理对象关联到帧缓冲区对象
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#ctx.texture, 0);

        // 将渲染缓冲区对象关联到帧缓冲区对象
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.#ctx.depthBuffer);

        // 检查帧缓冲区对象是否正确设置
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            this.throwErr(`useFramebuffer-${status.toString()}`);
        }

        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.unbindFramebuffer();
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };

    createFramebufferObject = (config?: WebGLFramebufferObjectConfig) => {
        const { useFrameBuffer = true, ...restConfig } = config ?? {};

        this.createFramebuffer();
        this.createTexture(restConfig);
        this.createRenderBuffer(restConfig);

        if (useFrameBuffer) {
            this.useFramebuffer();
        }
    };

    bindFramebuffer = () => {
        this.#ctx.gl.bindFramebuffer(this.#ctx.gl.FRAMEBUFFER, this.#ctx.framebuffer);
        this.#status.boundBuffer = true;
    };

    unbindFramebuffer = () => {
        this.#ctx.gl.bindFramebuffer(this.#ctx.gl.FRAMEBUFFER, null);
        this.#status.boundBuffer = false;
    };
}

export {
    //
    WebGLFramebufferObject,
    type WebGLFramebufferObjectConfig,
};
