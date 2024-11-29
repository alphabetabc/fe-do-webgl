import * as Dom from "./dom";
import * as Math from "./math";
import * as GLHelperLib from "./gl";
import { loadImage } from "./gl/helper";
import * as Hooks from "./hooks";
import { renderer } from "./Renderer";

export namespace GLHelper {
    export type Math = typeof Math;
    export type Dom = typeof Dom;
    export type Hooks = typeof Hooks;
    export type Utils = {
        loadImage: typeof loadImage;
    };
    export type WebGLRendererContext = GLHelperLib.WebGLRendererContext;
    export type createWebGLRendererContext = typeof GLHelperLib.createWebGLRendererContext;
    export type initContext2d = typeof GLHelperLib.context.initContext2d;
    export type renderer = typeof renderer;
}

export type * from "./gl/types";

export const GLHelper = {
    Math,
    Dom,
    Hooks,
    Utils: { loadImage },
    createWebGLRendererContext: GLHelperLib.createWebGLRendererContext,
    initContext2d: GLHelperLib.context.initContext2d,
    WebGLBufferObject: GLHelperLib.WebGLBufferObject,
    renderer,
};
