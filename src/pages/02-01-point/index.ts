import { GLHelper } from "@utils";
import vertexShaderSource from "./vertex.vert?raw";
import fragmentShaderSource from "./fragment.frag?raw";

const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());
ctx.useProgram(ctx.createProgram(vertexShaderSource, fragmentShaderSource));
ctx.gl.drawArrays(ctx.gl.POINTS, 0, 1);
