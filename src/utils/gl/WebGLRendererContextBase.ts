import { getContainer } from "../dom";
import { initContextGL } from "./context";
import { Matrix4, clamp } from "../math";

let id = 0;

/**
 * WebGLRendererContextBase的基础能力封装
 */
class WebGLRendererContextBase {
    #glContext: WebGLRenderingContext;
    #width: number = 0;
    #height: number = 0;

    #state = {
        contextLost: false,
    };

    constructor(public container: HTMLElement = getContainer()) {
        this.#init();
    }

    #init = () => {
        if (!this.container) {
            throw new Error("container is required");
        }
        id++;
        this.container.innerHTML = "";
        this.container.setAttribute("data-webgl-renderer-id", `renderer-${id}`);
        this.#glContext = initContextGL(this.container);

        const canvas = this.gl.canvas as HTMLCanvasElement;

        canvas.setAttribute("data-webgl-canvas-id", `canvas-${id}`);

        canvas.addEventListener("contextlost", () => {
            this.#state.contextLost = true;
        });
        canvas.addEventListener("contextrestored", () => {
            this.#state.contextLost = false;
        });

        this.#width = this.container.clientWidth;
        this.#height = this.container.clientHeight;

        // 开启隐藏面消除
        this.depthTest.enable();

        this.clear();
    };

    get gl() {
        if (!this.#glContext) {
            throw new Error(`WebGLRendererContextBase#gl is null`);
        }
        return this.#glContext;
    }

    get canvas() {
        return this.gl.canvas;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get contextLost() {
        return this.#state.contextLost;
    }

    depthMask = {
        /**
         * 释放深度缓冲区
         */
        enable: () => {
            this.gl.depthMask(true);
        },

        /**
         * 锁定用于进行隐藏面消除的深度缓冲区的写入操作，使之只读
         */
        disable: () => {
            this.gl.depthMask(false);
        },
    };

    /**
     * 深度测试
     */
    depthTest = {
        /**
         * 启用深度测试，隐藏面消除功能
         */
        enable: () => {
            this.gl.enable(this.gl.DEPTH_TEST);
        },
        disable: () => {
            this.gl.disable(this.gl.DEPTH_TEST);
        },
    };

    blend = {
        /**
         * 启动混合
         * α混合(alpha blending)
         * 混合(blending)
         * @param sfactor
         * @param dFactor
         */
        enable: (sfactor?: GLenum, dFactor?: GLenum) => {
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(sfactor ?? this.gl.SRC_ALPHA, dFactor ?? this.gl.ONE_MINUS_SRC_ALPHA);
        },
        disable: () => {
            this.gl.disable(this.gl.BLEND);
        },
        blendFunc: (sfactor?: GLenum, dFactor?: GLenum) => {
            this.gl.blendFunc(sfactor ?? this.gl.SRC_ALPHA, dFactor ?? this.gl.ONE_MINUS_SRC_ALPHA);
        },
        blendEquation: (mode: GLenum) => {
            this.gl.blendEquation(mode);
        },
    };

    polygonOffset = {
        enable: (type?: GLfloat) => {
            this.gl.enable(type ?? this.gl.POLYGON_OFFSET_FILL);
        },
        disable: (type?: GLfloat) => {
            this.gl.disable(type ?? this.gl.POLYGON_OFFSET_FILL);
        },
        offset: (factor: GLfloat, units: GLfloat) => {
            this.gl.polygonOffset(factor, units);
        },
    };

    clearColor = (color?: { r?: number; g?: number; b?: number; a?: number }) => {
        const r = clamp(color?.r ?? 0, 0, 1);
        const g = clamp(color?.g ?? 0, 0, 1);
        const b = clamp(color?.b ?? 0, 0, 1);
        const a = clamp(color?.a ?? 1, 0, 1);

        this.gl.clearColor(r, g, b, a);
    };

    clear = (clearColor?: { r?: number; g?: number; b?: number; a?: number }) => {
        // 清除颜色
        this.clearColor(clearColor);

        // this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        /**
         * @todo 是否每次clear的时候都需要清除
         */
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    };

    createShader = (type: number, source: string) => {
        const shader = this.gl.createShader(type);
        if (!shader) {
            throw new Error("Failed to create shader");
        }
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        const compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

        if (!compiled) {
            const shaderErr = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(JSON.stringify({ shaderErr, source }));
        }

        return shader;
    };

    createProgram = (vertexShaderSource: string, fragmentShaderSource: string) => {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);

        const fragmentShader = this.createShader(
            this.gl.FRAGMENT_SHADER,
            `
                #ifdef GL_ES
                precision mediump float;
                #endif
                ${fragmentShaderSource}
            `,
        );

        const program = this.gl.createProgram();
        if (!program) {
            throw new Error("Failed to create program");
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        const linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!linked) {
            const err = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            this.gl.deleteShader(vertexShader);
            this.gl.deleteShader(fragmentShader);
            throw new Error(err);
        }

        return { program, vertexShader, fragmentShader };
    };

    useProgram = (program: WebGLProgram) => {
        this.gl.useProgram(program);
    };

    getAttribLocation: WebGLRenderingContext["getAttribLocation"] = (program, name) => {
        const location = this.gl.getAttribLocation(program, name);
        if (location < 0) {
            throw new Error(`Failed to get the storage location of ${name}`);
        }
        return location;
    };

    getUniformLocation: WebGLRenderingContext["getUniformLocation"] = (program, name) => {
        const location = this.gl.getUniformLocation(program, name);

        if (location === null) {
            throw new Error(`Failed to get the storage location of ${name}`);
        }

        return location;
    };

    createBuffer = (data: AllowSharedBufferSource, target?: GLenum, usage?: GLenum) => {
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error("Failed to create vertex buffer");
        }

        this.gl.bindBuffer(target ?? this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(target ?? this.gl.ARRAY_BUFFER, data, usage ?? this.gl.STATIC_DRAW);

        return buffer;
    };

    createArrayBuffer = (data: AllowSharedBufferSource) => {
        return this.createBuffer(data, this.gl.ARRAY_BUFFER, this.gl.STATIC_DRAW);
    };

    createElementArrayBuffer = (data: AllowSharedBufferSource) => {
        return this.createBuffer(data, this.gl.ELEMENT_ARRAY_BUFFER, this.gl.STATIC_DRAW);
    };

    unBindArrayBuffer = () => {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    };

    unBindElementArrayBuffer = () => {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    };

    /**
     * 顶点着色器中的uniform变量
     */
    uniformMatrix4fv = (location: WebGLUniformLocation, matrix: Matrix4) => {
        // 将矩阵传递给顶点着色器
        this.gl.uniformMatrix4fv(location, false, matrix.elements);
    };

    createTexture = (
        image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
        config?: {
            /**
             * `gl.activeTexture(config.activeTexture)`
             */
            activeTexture?: GLenum;

            /**
             * `gl.uniform1i(location, config.textureUnit ?? 0)`
             */
            textureUnit?: Parameters<WebGLRenderingContext["uniform1i"]>[1];
        },
    ) => {
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

        return { texture };
    };

    useTexture = (
        location: WebGLUniformLocation,
        image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
        config?: Parameters<WebGLRendererContextBase["createTexture"]>[1],
    ) => {
        const { texture } = this.createTexture(image, config);

        const gl = this.gl;

        // TODO: 是否一直使用 uniform1i?
        // 将纹理单元传递给着色器变量
        gl.uniform1i(location, config.textureUnit ?? 0);

        return { texture };
    };
}

export {
    //
    WebGLRendererContextBase,
};
