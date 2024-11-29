import { GLHelper } from "@utils";
import fragmentSource from "./fragment.frag?raw";
import vertexSource from "./vertex.vert?raw";

import { ParticleManager } from "./Particle";

GLHelper.renderer<{
    [key: string]: any;
    particleManager: ParticleManager;
    perspectiveMatrix: InstanceType<typeof GLHelper.Math.Matrix4>;
    modelMatrix: InstanceType<typeof GLHelper.Math.Matrix4>;
    viewMatrix: InstanceType<typeof GLHelper.Math.Matrix4>;
}>({
    setup(hooks) {
        const ctx = GLHelper.createWebGLRendererContext(GLHelper.Dom.getContainer());

        const { shader } = ctx.createShaderProgram({
            uniforms: {
                u_PerspectiveMatrix: {},
                u_ModelMatrix: {},
                u_ViewMatrix: {},
                u_LightDir: {},
                u_Sampler: {},
                u_Alpha: {},
            },
            attributes: {
                a_Position: {},
                a_TexCoord: {},
            },
            vertexShader: vertexSource,
            fragmentShader: fragmentSource,
        });

        const particleManager = new ParticleManager(ctx);
        particleManager.loadTexture("/assets/particle.png");
        particleManager.initParticle();

        const quadBuffer = {
            useVertices: ctx
                .createArrayBufferObject(
                    new Float32Array(
                        [
                            [-0.5, -0.5, 0],
                            [0.5, -0.5, 0],
                            [0.5, 0.5, 0],
                            [-0.5, 0.5, 0],
                        ].flat(1),
                    ),
                )
                .createUseBufferExecutor(shader.getAttributeLocation("a_Position")),
            useTexCoords: ctx
                .createArrayBufferObject(
                    new Float32Array(
                        [
                            [0, 0],
                            [1, 0],
                            [1, 1],
                            [0, 1],
                        ].flat(1),
                    ),
                )
                .createUseBufferExecutor(shader.getAttributeLocation("a_TexCoord"), { size: 2 }),
            normals: ctx.createArrayBufferObject(
                new Float32Array(
                    [
                        [0, 0, 1],
                        [0, 0, 1],
                        [0, 0, 1],
                        [0, 0, 1],
                    ].flat(1),
                ),
            ),
            useIndices: ctx
                .createElementArrayBufferObject(
                    new Uint8Array(
                        [
                            [0, 1, 2],
                            [2, 3, 0],
                        ].flat(),
                    ),
                )
                .createUseBufferExecutor(),
            indexLength: 6,
        };

        {
            ctx.depthTest.enable();
            ctx.depthMask.disable();

            ctx.clearColor({ r: 0, g: 0, b: 0, a: 1 });

            ctx.blend.enable(ctx.gl.SRC_ALPHA, ctx.gl.ONE);
            // todo: 这个有没有问题？？
            ctx.blend.blendEquation(ctx.gl.FUNC_ADD);
        }

        const perspectiveMatrix = GLHelper.Math.Matrix4.create();
        const modelMatrix = GLHelper.Math.Matrix4.create();
        const viewMatrix = GLHelper.Math.Matrix4.create();
        const lightDir = GLHelper.Math.Vector3.create([0, 0.4, 0.6]);

        hooks.onFrameLoop(() => {
            if (!particleManager.image) return;

            hooks.setState({
                shader,
                particleManager,
                quadBuffer,
                perspectiveMatrix,
                modelMatrix,
                viewMatrix,
                lightDir,
            });
        });

        return ctx;
    },

    render(ctx, state) {
        ctx.clear();

        const { particleManager, shader, perspectiveMatrix, viewMatrix, modelMatrix, quadBuffer, lightDir } = state;
        particleManager.updateParticle();

        {
            perspectiveMatrix.setPerspective(30, ctx.width / ctx.height, 1, 10000);
            viewMatrix.setLookAt(
                GLHelper.Math.Vector3.create([0, 3, 10]),
                GLHelper.Math.Vector3.create([0, 2, 0]),
                GLHelper.Math.Vector3.create([0, 1, 0]),
            );

            ctx.uniformMatrix4fv(shader.getUniformLocation("u_PerspectiveMatrix"), perspectiveMatrix);
            ctx.uniformMatrix4fv(shader.getUniformLocation("u_ViewMatrix"), viewMatrix);
            // todo: 报错
            // ctx.gl.uniform3fv(shader.getUniformLocation("u_LightDir"), lightDir.elements);
        }

        {
            quadBuffer.useVertices();
            quadBuffer.useTexCoords();
            particleManager.useTexture(shader.getUniformLocation("u_Sampler"));
            quadBuffer.useIndices();

            particleManager.particleCollection.forEach((particle) => {
                if (particle.wait <= 0) {
                    modelMatrix.setTranslate(particle.position[0], particle.position[1], particle.position[2]);
                    modelMatrix.rotate(particle.angle, 0, 0, 1);
                    const scale = particle.scale * 0.5;
                    modelMatrix.scale(scale, scale, scale);

                    ctx.uniformMatrix4fv(shader.getUniformLocation("u_ModelMatrix"), modelMatrix);
                    ctx.gl.uniform1f(shader.getUniformLocation("u_Alpha"), particle.alpha);

                    ctx.gl.drawElements(ctx.gl.TRIANGLES, quadBuffer.indexLength, ctx.gl.UNSIGNED_BYTE, 0);
                }
            });
        }
    },
});
