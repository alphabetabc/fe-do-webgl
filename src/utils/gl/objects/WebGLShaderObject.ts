import { WebGLRendererContext } from "../WebGLRendererContext";

interface IShaderObjectConstructOptions<TUniforms = Record<string, any>, TAttrs = Record<string, any>> {
    uniforms?: TUniforms;
    attributes?: TAttrs;
    vertexShader: string;
    fragmentShader: string;
}

class WebGLShaderObject<T extends IShaderObjectConstructOptions> {
    uniforms: T["uniforms"];
    attributes: T["attributes"] = {};
    vertexShaderSource: string;
    fragmentShaderSource: string;

    #webGLObject = {
        program: null as WebGLProgram | null,
        vertexShader: null as WebGLShader | null,
        fragmentShader: null as WebGLShader | null,
    };

    constructor(
        public shaderSource: IShaderObjectConstructOptions<T["uniforms"], T["attributes"]>,
        private context: WebGLRendererContext,
    ) {
        this.uniforms = shaderSource.uniforms;
        this.attributes = shaderSource.attributes || {};
        this.vertexShaderSource = shaderSource.vertexShader;
        this.fragmentShaderSource = shaderSource.fragmentShader;
    }

    get program() {
        return this.#webGLObject.program;
    }

    get vertexShader() {
        return this.#webGLObject.vertexShader;
    }

    get fragmentShader() {
        return this.#webGLObject.fragmentShader;
    }

    attachWebGLObject = (obj: { program: WebGLProgram; vertexShader: WebGLShader; fragmentShader: WebGLShader }) => {
        for (const key in obj) {
            if (key in this.#webGLObject) {
                this.#webGLObject[key] = obj[key];
            }
        }
    };

    getUniformName = (name: keyof typeof this.uniforms) => {
        return name in this.uniforms ? name : null;
    };

    getUniform = (name: keyof typeof this.uniforms) => {
        const uniformName = this.getUniformName(name);
        if (uniformName) {
            return this.uniforms[uniformName];
        }
        return null;
    };

    getUniformLocation = (name: keyof typeof this.uniforms) => {
        return this.context.getUniformLocation(this.program, name as string);
    };

    getAttributeName = (name: keyof typeof this.attributes) => {
        return name in this.attributes ? name : null;
    };

    getAttribute = (name: keyof typeof this.attributes) => {
        const attributeName = this.getAttributeName(name);
        if (attributeName) {
            return this.attributes[attributeName];
        }
        return null;
    };

    getAttributeLocation = (name: keyof typeof this.attributes) => {
        return this.context.getAttribLocation(this.program, name as string);
    };
}

export {
    //
    WebGLShaderObject,
    IShaderObjectConstructOptions,
};
