import { GLHelper } from "@utils";
import { normals, vertices, texCoords, indices } from "./data";
const createCubeBufferObject = (ctx: GLHelper.WebGLRendererContext) => {
    const vertexBufferObject = ctx.createArrayBufferObject(vertices);
    const normalBufferObject = ctx.createArrayBufferObject(normals);
    const texCoordBufferObject = ctx.createArrayBufferObject(texCoords);

    const indicesBuffer = ctx.createElementArrayBuffer(indices);

    const cube = {
        useVertexBuffer: (location: any) => {
            vertexBufferObject.useBuffer(location, { size: 3 });
        },
        useNormalBuffer: (location: any) => {
            normalBufferObject.useBuffer(location, { size: 3 });
        },
        useTexCoordBuffer: (location: any) => {
            texCoordBufferObject.useBuffer(location, { size: 2 });
        },

        useIndicesBuffer: () => {
            ctx.gl.bindBuffer(ctx.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        },

        get indexBufferType() {
            return ctx.gl.UNSIGNED_BYTE;
        },

        get indicesLength() {
            return indices.length;
        },
    };

    ctx.unBindArrayBuffer();
    ctx.unBindElementArrayBuffer();

    return cube;
};

export {
    //
    createCubeBufferObject,
};
