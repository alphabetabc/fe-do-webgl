import * as Dom from "./dom";
import * as Math from "./math";
import * as GLHelperLib from "./gl";
import * as Hooks from "./hooks";

export namespace GLHelper {
    export type Math = typeof Math;
    export type Dom = typeof Dom;
    export type Hooks = typeof Hooks;
    export type WebGLRendererContext = GLHelperLib.WebGLRendererContext;
    export type createWebGLRendererContext = typeof GLHelperLib.createWebGLRendererContext;
}

export const GLHelper = {
    Math,
    Dom,
    Hooks,
    createWebGLRendererContext: GLHelperLib.createWebGLRendererContext,
};
