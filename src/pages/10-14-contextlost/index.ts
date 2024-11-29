import { GLHelper } from "@utils";
import { vertices, colors, indices } from "./data";

GLHelper.renderer({
    setup(hooks) {
        const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

        const { shader } = ctx.createShaderProgram({
            attributes: {
                a_Position: {},
                a_Color: {},
            },
            uniforms: {
                u_MvpMatrix: {},
            },

            vertexShader: `
                attribute vec4 a_Position;
                attribute vec4 a_Color;
                uniform mat4 u_MvpMatrix;
                varying vec4 v_Color;
                void main() {
                    gl_Position = u_MvpMatrix * a_Position;
                    v_Color = a_Color;
                }
            `,
            fragmentShader: `
                varying vec4 v_Color;
                void main() {
                    gl_FragColor = v_Color;
                }
            `,
        });

        ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Position"), vertices, 3);
        ctx.createVertexArrayBuffer(shader.getAttributeLocation("a_Color"), colors, 4);

        //
        ctx.createElementArrayBuffer(indices);

        const mvpMatrix = new GLHelper.Math.Matrix4();

        hooks.setState({ mvpMatrix, shader });

        let i = 0;
        hooks.onFrameLoop(() => {
            i -= 1.2;
            if (i > 360) {
                i = 0;
            }
            hooks.setState({ angle: i });
        });

        //
        return ctx;
    },
    render(ctx, state) {
        const { mvpMatrix, shader, angle } = state;
        // 相当于每次都重新设置
        mvpMatrix.setPerspective(30, ctx.width / ctx.height, 1, 1000);
        mvpMatrix.lookAt(
            //
            GLHelper.Math.Vector3.fromXYZ(3, 3, 10),
            GLHelper.Math.Vector3.fromXYZ(0, 0, -2),
            GLHelper.Math.Vector3.fromXYZ(0, 1, 0),
        );

        mvpMatrix.rotate(angle, 0, 1, 0);
        ctx.uniformMatrix4fv(shader.getUniformLocation("u_MvpMatrix"), mvpMatrix);

        //
        ctx.depthMask.disable();
        ctx.blend.enable();
        ctx.clear();
        ctx.gl.drawElements(ctx.gl.TRIANGLES, indices.length, ctx.gl.UNSIGNED_BYTE, 0);
        ctx.depthMask.enable();
    },
});
