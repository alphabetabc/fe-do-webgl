class Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
    static create(opt_src?: [number, number, number, number]) {
        return new Vector4(opt_src);
    }

    static fromXYZW(x: number, y: number, z: number, w: number) {
        return new Vector4([x, y, z, w]);
    }

    elements: Float32Array;
    constructor(opt_src?: [number, number, number, number]) {
        const v = new Float32Array(4);
        if (opt_src && typeof opt_src === "object") {
            v[0] = opt_src[0];
            v[1] = opt_src[1];
            v[2] = opt_src[2];
            v[3] = opt_src[3];
        }
        this.elements = v;

        Object.defineProperties(this, {
            x: {
                get() {
                    return v[0];
                },
            },
            y: {
                get() {
                    return v[1];
                },
            },
            z: {
                get() {
                    return v[2];
                },
            },
            w: {
                get() {
                    return v[3];
                },
            },
        });
    }
}

export { Vector4 };
