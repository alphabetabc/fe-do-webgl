import { loadImage, withPromise } from "../helper";
import { WebGLRendererContext } from "../WebGLRendererContext";

type TConfig = {
    location?: WebGLUniformLocation;

    url?: string;

    useTexImage2DFromWH?: boolean;

    width?: number;
    height?: number;

    /**
     * `gl.activeTexture(config.activeTexture)`
     */
    activeTexture?: GLenum;

    /**
     * `gl.uniform1i(location, config.textureUnit ?? 0)`
     */
    textureUnit?: Parameters<WebGLRenderingContext["uniform1i"]>[1];
};

// 纹理对象
class WebGLTextureObject {
    constructor(rendererContext: WebGLRendererContext, config?: TConfig) {
        this.#ctx.rendererContext = rendererContext;
        this.#ctx.gl = rendererContext.gl;
        this.#ctx.config = config;
        this.loadTexture();
    }

    #ctx = {
        rendererContext: null as WebGLRendererContext,
        gl: null as WebGLRenderingContext,
        image: null as HTMLImageElement | null,
        texture: null as WebGLTexture,
        loaderDefer: withPromise(),
        defer: withPromise<{ image: HTMLImageElement | null; texture: WebGLTexture }>(),
        config: null as TConfig,
    };

    #notifySuccess = () => {
        const result = {
            image: this.image,
            texture: this.texture,
        };
        this.#ctx.defer.resolve(result);
        return result;
    };

    #notifyError = (error: any) => {
        this.#ctx.defer.reject(error);
        return new Error(error.message ?? error);
    };

    get ready() {
        return this.#ctx.defer.promise;
    }

    get image() {
        return this.#ctx.image;
    }

    get texture() {
        return this.#ctx.texture;
    }

    loadTexture = async () => {
        this.createTexture();
        this.loadImage();
        await this.#ctx.loaderDefer.promise;

        if (this.#ctx.config.useTexImage2DFromWH) {
            this.texImage2DFromWH();
        } else {
            this.texImage2D();
        }
    };

    loadImage = async () => {
        const { url } = this.#ctx.config;

        if ([null, undefined, ""].includes(url)) {
            this.#ctx.loaderDefer.resolve(null);
            return;
        }

        try {
            const image = await loadImage(url);
            this.#ctx.loaderDefer.resolve({ image, texture: this.texture });
            this.#ctx.image = image;
        } catch (error) {
            this.#ctx.loaderDefer.reject(error);
        }
    };

    useTextureAsync = async () => {
        try {
            await this.#ctx.loaderDefer.promise;
            this.uniform1i();
            return this.#notifySuccess();
        } catch (error) {
            return Promise.reject(this.#notifyError(error));
        }
    };

    //#region ----- raw api -----
    createTexture = () => {
        const gl = this.#ctx.gl;
        // 创建纹理对象
        const texture = gl.createTexture();
        // 将图片像素反转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        // 开启0号纹理单元
        gl.activeTexture(this.#ctx.config.activeTexture ?? gl.TEXTURE0);
        // 将纹理绑定到目标
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // 设置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        this.#ctx.texture = texture;
    };

    texImage2D = () => {
        const gl = this.#ctx.gl;
        // 将图片像素写入纹理对象
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.#ctx.image);
    };

    texImage2DFromWH = () => {
        const { config } = this.#ctx;
        const gl = this.#ctx.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, config.width ?? 512, config.height ?? 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    };

    uniform1i = (location?: WebGLUniformLocation, textureUnit?: TConfig["textureUnit"]) => {
        // TODO: 是否一直使用 uniform1i?
        // 将纹理单元传递给着色器变量
        this.#ctx.gl.uniform1i(location ?? this.#ctx.config.location, textureUnit ?? this.#ctx.config.textureUnit ?? 0);
    };

    //#endregion ----- raw api -----
}

export {
    //
    WebGLTextureObject,
};
