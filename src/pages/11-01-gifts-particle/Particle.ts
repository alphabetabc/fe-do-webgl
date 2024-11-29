import { GLHelper, GLHelper_WebGLUniformLocation } from "@utils";

class Particle {
    velocity: any[] = [];
    position: any[] = [];
    angle: number;
    scale: number;
    alpha: number;
    wait: number;
    constructor(wait?: boolean) {
        this.update(wait);
    }

    update(wait?: boolean) {
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 0.08 + 0.13;
        const speed = Math.random() * 0.01 + 0.02;

        this.velocity = [Math.cos(angle) * speed, height, Math.sin(angle) * speed];
        this.position = [Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2];

        this.angle = Math.random() * 360;
        this.scale = Math.random() * 0.5 + 0.5;
        this.alpha = 5;
        if (wait === true) {
            this.wait = Math.random() * 120;
        }
    }
}

class ParticleManager {
    #state = {
        ctx: null as GLHelper.WebGLRendererContext,
        gl: null as WebGLRenderingContext,
        texture: null as WebGLTexture,
        image: null as HTMLImageElement,
    };
    particleCollection: Particle[];

    constructor(ctx: GLHelper.WebGLRendererContext) {
        this.#state.ctx = ctx;
        this.#state.gl = ctx.gl;
    }

    get image() {
        return this.#state.image;
    }

    loadTexture = async (url: string) => {
        const { gl } = this.#state;

        const texture = gl.createTexture();
        this.#state.texture = texture;
        const image = await GLHelper.Utils.loadImage(url);

        this.#state.image = image;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };

    useTexture = (location: GLHelper_WebGLUniformLocation) => {
        const { gl, texture, image } = this.#state;
        if (!image) return;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(location, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };

    initParticle = (n = 500) => {
        const particleCollection = (this.particleCollection = []);
        for (let i = 0; i < n; i++) {
            const particle = new Particle(true);
            particleCollection.push(particle);
        }
    };

    updateParticle = () => {
        const particleCollection = this.particleCollection;
        particleCollection.forEach((particle, index) => {
            if (particle.wait > 0) {
                particle.wait--;
                return;
            }

            particle.position[0] += particle.velocity[0];
            particle.position[1] += particle.velocity[1];
            particle.position[2] += particle.velocity[2];

            particle.velocity[1] -= 0.005;
            particle.alpha -= 0.05;

            if (particle.alpha <= 0) {
                particle.update(false);
            }
        });
    };
}

export {
    //
    ParticleManager,
};
