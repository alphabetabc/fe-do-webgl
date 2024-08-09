import { Matrix4 } from "../math";

import { WebGLRendererContextBase } from "./WebGLRendererContextBase";
import { IShaderObjectConstructOptions, WebGLShaderObject } from "./objects/WebGLShaderObject";
import { WebGLArrayBufferObject } from "./objects/WebGLArrayBufferObject";

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
     * 创建顶点数组缓冲区对象
     * @param data AllowSharedBufferSource
     * @returns
     */
    createArrayBufferObject = (data: AllowSharedBufferSource) => {
        return new WebGLArrayBufferObject(this, data);
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
        config: {
            url: string;
            /**
             * `gl.activeTexture(config.activeTexture)`
             */
            activeTexture?: GLenum;

            /**
             * `gl.uniform1i(location, config.textureUnit ?? 0)`
             */
            textureUnit?: Parameters<WebGLRenderingContext["uniform1i"]>[1];
            onLoaded?: () => void;
        },
    ) => {
        const { url } = config;

        if (!url) {
            throw new Error("url is required");
        }

        const image = await loadImage(url);

        const gl = this.gl;

        // 创建纹理对象
        const texture = gl.createTexture();
        // 将图片像素反转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        // 开启0号纹理单元
        gl.activeTexture(config.activeTexture ?? gl.TEXTURE0);
        // 将纹理绑定到目标
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // 设置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // 将图片像素写入纹理对象
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // 将纹理单元传递给着色器变量
        gl.uniform1i(location, config.textureUnit ?? 0);

        config.onLoaded?.();

        return { image, texture };
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
