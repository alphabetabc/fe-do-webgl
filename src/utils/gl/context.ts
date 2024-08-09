const initCanvas = (container: HTMLElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvas.setAttribute("data-gl-helper", "v0");
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

export { initCanvas, getContextGL, initContextGL, initContextGL2 };
