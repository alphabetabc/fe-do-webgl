import { version } from "./version";

const initCanvas = (container: HTMLElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvas.setAttribute("data-gl-helper", `v${version}`);
    container.appendChild(canvas);
    return canvas;
};

const getContextGL = (canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl");
    if (!gl) throw new Error("WebGL not supported");
    return gl;
};

const getContextGL2 = (canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");
    return gl;
};

const initContextGL = (container: HTMLElement) => {
    return getContextGL(initCanvas(container));
};

const initContextGL2 = (container: HTMLElement) => {
    return getContextGL2(initCanvas(container));
};

const initContext2d = (container: HTMLElement) => {
    type TDrawer = (context: CanvasRenderingContext2D, ...args: any[]) => void;

    type TCanvasRenderingContext2D = CanvasRenderingContext2D & {
        call<T extends TDrawer>(drawer: T, ...args: Parameters<T> extends [CanvasRenderingContext2D, ...infer Rest] ? Rest : never): void;
    };

    const ctx = initCanvas(container).getContext("2d");

    Object.defineProperty(ctx, "call", {
        value: (() => {
            return (drawer: TDrawer, ...args: any[]) => {
                drawer(ctx, ...args);
            };
        })(),
    });

    return ctx as TCanvasRenderingContext2D;
};

export { initCanvas, getContextGL, initContextGL, initContextGL2, initContext2d };
