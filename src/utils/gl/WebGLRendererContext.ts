import { Matrix4 } from "../math";

import { WebGLRendererContextBase } from "./WebGLRendererContextBase";
import { IShaderObjectConstructOptions, WebGLShaderObject } from "./objects/WebGLShaderObject";
import { WebGLArrayBufferObject } from "./objects/WebGLArrayBufferObject";
import { WebGLFramebufferObject, type WebGLFramebufferObjectConfig } from "./objects/WebGLFrameBufferObject";
import { WebGLElementArrayBufferObject } from "./objects/WebGLElementArrayBufferObject";
import { WebGLTextureObject } from "./objects/WebGLTextureObject";
import { WebGLEmptyBufferObject } from "./objects/WebGLEmptyBufferObject";

import { loadImage } from "./helper";
import { Stack } from "./Stack";

import { type GLHelper_WebGLAttribLocation } from "./types";

/**
 * WebGLRendererContext
 */
class WebGLRendererContext extends WebGLRendererContextBase {
    get matrixStack() {
        return Stack.get<Matrix4>(this, "matrixStack", (item) => new Matrix4(item));
    }

    /**
     * 创建空缓冲区对象
     * @param location 顶点属性位置
     * @param config.size 数据大小，默认为3 --- vertexAttribPointer
     * @param config.type 数据类型,默认为gl.Float --- vertexAttribPointer
     * @param config.stride 步长，默认为0 --- vertexAttribPointer
     * @param config.offset 偏移，默认为0 --- vertexAttribPointer
     * @param config.target gl.ARRAY_BUFFER 或 gl.ELEMENT_ARRAY_BUFFER
     */
    createLocationEmptyBufferObject = (
        location: GLHelper_WebGLAttribLocation,
        config?: Parameters<WebGLEmptyBufferObject["useBuffer"]>[1] & { target: GLenum },
    ) => {
        return new WebGLEmptyBufferObject(this, location, config);
    };

    /**
     * 帧缓冲区对象
     * - 通过 `obj.bindFramebuffer` 将纹理对象关联到帧缓冲区对象，
     * - 通过 `obj.unbindFramebuffer` 将纹理对象与帧缓冲区对象解除关联
     */
    createFramebufferObject = (config: WebGLFramebufferObjectConfig) => {
        return new WebGLFramebufferObject(this, config);
    };

    /**
     * 创建顶点数组缓冲区对象
     * @param data AllowSharedBufferSource
     * @returns
     */
    createArrayBufferObject = (data: AllowSharedBufferSource) => {
        return new WebGLArrayBufferObject(this, data);
    };

    /**
     * 创建索引数组缓冲区对象
     */
    createElementArrayBufferObject = (data: AllowSharedBufferSource) => {
        return new WebGLElementArrayBufferObject(this, data);
    };

    /**
     * 创建顶点数组缓冲区对象
     * @param location GLHelper_WebGLAttribLocation
     * @param vertices AllowSharedBufferSource
     * @param size 一个整数，指定每个顶点属性的组件数量 (例如，顶点位置由vec3表示，则size=3)
     */
    createVertexArrayBuffer = (location: GLHelper_WebGLAttribLocation, vertices: AllowSharedBufferSource, size?: number) => {
        // const vertexBuffer = this.createArrayBuffer(vertices);

        //  将缓冲区对象分配给attribute变量
        // this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
        // this.gl.enableVertexAttribArray(location);

        // return vertexBuffer;
        const arrayBufferObject = this.createArrayBufferObject(vertices);
        arrayBufferObject.useBuffer(location, { size });
        return arrayBufferObject.buffer;
    };

    /**
     * 基于 ShaderObject 创建 WebGLProgram
     */
    createShaderProgram = <T extends IShaderObjectConstructOptions>(shader: T, enableProgram: boolean = true) => {
        const shaderObject = new WebGLShaderObject<T>(shader, this);
        const { program, vertexShader, fragmentShader } = this.createProgram(shaderObject.vertexShaderSource, shaderObject.fragmentShaderSource);
        shaderObject.attachWebGLObject({ program, vertexShader, fragmentShader });

        if (!program) {
            return null;
        }

        if (enableProgram) {
            this.useProgram(program);
        }

        return { program, shader: shaderObject };
    };

    /**
     * 加载纹理
     */
    loadTexture = async (
        location: WebGLUniformLocation,
        config: Parameters<WebGLRendererContext["createTexture"]>[1] & { url: string; onLoaded?: () => void },
    ) => {
        const { url, onLoaded, ...restConfig } = config;

        if (!url) {
            throw new Error("url is required");
        }

        const image = await loadImage(url);

        // 创建纹理对象
        const { texture } = this.useTexture(location, image, restConfig);

        if (onLoaded) {
            onLoaded();
        }

        return { image, texture };
    };

    /**
     * 创建纹理对象
     * @param config
     * @returns
     */
    createTextureObject = (config: ConstructorParameters<typeof WebGLTextureObject>[1]) => {
        const textureObject = new WebGLTextureObject(this, config);

        if ("location" in config) {
            textureObject.useTextureAsync();
        }

        return textureObject;
    };
}

const createWebGLRendererContext = (container: HTMLElement) => {
    return new WebGLRendererContext(container);
};

export {
    //
    type WebGLRendererContext,
    createWebGLRendererContext,
};
