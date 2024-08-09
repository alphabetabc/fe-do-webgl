/**
 * Constructor of Vector3
 * If opt_src is specified, new vector is initialized by opt_src.
 * @param opt_src source vector(option)
 */
class Vector3 {
    x: number;
    y: number;
    z: number;
    static create(opt_src?: [number, number, number]) {
        return new Vector3(opt_src);
    }

    static fromXYZ(x: number, y: number, z: number) {
        return new Vector3([x, y, z]);
    }

    elements: Float32Array;
    constructor(opt_src?: [number, number, number]) {
        const v = new Float32Array(3);
        if (opt_src && typeof opt_src === "object") {
            v[0] = opt_src[0] + 0;
            v[1] = opt_src[1] + 0;
            v[2] = opt_src[2] + 0;
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
        });
    }

    normalize() {
        const elements = this.elements;
        let c = elements[0],
            d = elements[1],
            e = elements[2],
            g = Math.sqrt(c * c + d * d + e * e);
        if (g) {
            if (g == 1) return this;
        } else {
            elements[0] = 0;
            elements[1] = 0;
            elements[2] = 0;
            return this;
        }
        g = 1 / g;
        elements[0] = c * g;
        elements[1] = d * g;
        elements[2] = e * g;
        return this;
    }
}

export { Vector3 };
