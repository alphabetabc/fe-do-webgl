import { GLHelper_WebGLAttribLocation } from "../types";
import { WebGLRendererContext } from "../WebGLRendererContext";
import { WebGLBufferObject, type TWebGLBufferObjectConfig } from "./WebGLBufferObject";

/**
 * 空缓冲区对象
 */
class WebGLEmptyBufferObject extends WebGLBufferObject {
    constructor(
        rendererContext: WebGLRendererContext,
        location: GLHelper_WebGLAttribLocation,
        config?: Parameters<WebGLBufferObject["useBuffer"]>[1] & { target: GLenum },
    ) {
        const { target, ...restConfig } = config;
        super(rendererContext, { target });
        this.useBuffer(location, restConfig);
    }
}

export {
    //
    WebGLEmptyBufferObject,
    TWebGLBufferObjectConfig,
};
