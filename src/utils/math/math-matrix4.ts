import { Vector3 } from "./math-vector3";
import { Vector4 } from "./math-vector4";

class Matrix4 {
    static create(opt?: any) {
        return new Matrix4(opt);
    }

    elements: Float32Array;
    constructor(opt?: any) {
        if (opt && typeof opt === "object" && opt.hasOwnProperty("elements")) {
            const s = opt.elements;
            const d = new Float32Array(16);
            for (let i = 0; i < 16; i++) {
                d[i] = s[i];
            }
            this.elements = d;
        } else {
            this.elements = new Float32Array(
                [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1],
                ].flat(),
            );
        }
    }

    clone() {
        return new Matrix4({ elements: this.elements });
    }

    /**
     * 初始化为单位矩阵
     * Set the identity matrix.
     * @return this
     */
    setIdentity() {
        const elements = this.elements;
        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        identity.forEach((d, i) => (elements[i] = d));
        return this;
    }

    /**
     * 将matrix4实例设置为m,也必须是matrix4实例
     * Copy matrix.
     * @param mt4Instance source matrix
     * @return this
     */
    set(mt4Instance: Matrix4) {
        const srcElements = mt4Instance.elements;
        const elements = this.elements;
        if (srcElements === elements) {
            return;
        }
        for (let i = 0; i < 16; i++) {
            elements[i] = srcElements[i];
        }
        return this;
    }

    /**
     * Multiply the matrix from the right.
     * @param other The multiply matrix
     * @return this
     */
    concat(other: Matrix4) {
        // Calculate e = a * b
        const elements = this.elements;
        let otherElements = other.elements;

        // If e equals b, copy b to temporary matrix.
        if (elements === otherElements) {
            otherElements = new Float32Array(16);
            for (let i = 0; i < 16; ++i) {
                otherElements[i] = elements[i];
            }
        }

        for (let i = 0; i < 4; i++) {
            const ai0 = elements[i];
            const ai1 = elements[i + 4];
            const ai2 = elements[i + 8];
            const ai3 = elements[i + 12];
            elements[i] = ai0 * otherElements[0] + ai1 * otherElements[1] + ai2 * otherElements[2] + ai3 * otherElements[3];
            elements[i + 4] = ai0 * otherElements[4] + ai1 * otherElements[5] + ai2 * otherElements[6] + ai3 * otherElements[7];
            elements[i + 8] = ai0 * otherElements[8] + ai1 * otherElements[9] + ai2 * otherElements[10] + ai3 * otherElements[11];
            elements[i + 12] = ai0 * otherElements[12] + ai1 * otherElements[13] + ai2 * otherElements[14] + ai3 * otherElements[15];
        }

        return this;
    }

    multiply(other: Matrix4) {
        return this.concat(other);
    }

    /**
     * Multiply the three-dimensional vector.
     * @param pos  The multiply vector
     * @return The result of multiplication(Float32Array)
     */
    multiplyVector3(pos) {
        const e = this.elements;
        const p = pos.elements;
        const v = new Vector3();
        const result = v.elements;

        result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + e[12];
        result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + e[13];
        result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[14];

        return v;
    }

    /**
     * Multiply the four-dimensional vector.
     * @param pos  The multiply vector
     * @return The result of multiplication(Float32Array)
     */
    multiplyVector4(pos) {
        const e = this.elements;
        const p = pos.elements;
        const v = new Vector4();
        const result = v.elements;

        result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + p[3] * e[12];
        result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + p[3] * e[13];
        result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14];
        result[3] = p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15];

        return v;
    }

    /**
     * 对自身进行转置操作，并将自身设为转置后的结果
     * Transpose the matrix.
     * @return this
     */
    transpose() {
        const elements = this.elements;
        [elements[1], elements[4]] = [elements[4], elements[1]];
        [elements[2], elements[8]] = [elements[8], elements[2]];
        [elements[3], elements[12]] = [elements[12], elements[3]];
        [elements[6], elements[9]] = [elements[9], elements[6]];
        [elements[7], elements[13]] = [elements[13], elements[7]];
        [elements[11], elements[14]] = [elements[14], elements[11]];

        return this;
    }

    /**
     * 使自身(调用本方法的Matrix4类型的实例)成为矩阵m的逆矩阵
     * Calculate the inverse matrix of specified matrix, and set to this.
     * @param other The source matrix
     * @return this
     */
    setInverseOf(other: Matrix4) {
        const sourceElements = other.elements;
        const elements = this.elements;
        const inverse = new Float32Array(16);

        inverse[0] =
            sourceElements[5] * sourceElements[10] * sourceElements[15] -
            sourceElements[5] * sourceElements[11] * sourceElements[14] -
            sourceElements[9] * sourceElements[6] * sourceElements[15] +
            sourceElements[9] * sourceElements[7] * sourceElements[14] +
            sourceElements[13] * sourceElements[6] * sourceElements[11] -
            sourceElements[13] * sourceElements[7] * sourceElements[10];
        inverse[4] =
            -sourceElements[4] * sourceElements[10] * sourceElements[15] +
            sourceElements[4] * sourceElements[11] * sourceElements[14] +
            sourceElements[8] * sourceElements[6] * sourceElements[15] -
            sourceElements[8] * sourceElements[7] * sourceElements[14] -
            sourceElements[12] * sourceElements[6] * sourceElements[11] +
            sourceElements[12] * sourceElements[7] * sourceElements[10];
        inverse[8] =
            sourceElements[4] * sourceElements[9] * sourceElements[15] -
            sourceElements[4] * sourceElements[11] * sourceElements[13] -
            sourceElements[8] * sourceElements[5] * sourceElements[15] +
            sourceElements[8] * sourceElements[7] * sourceElements[13] +
            sourceElements[12] * sourceElements[5] * sourceElements[11] -
            sourceElements[12] * sourceElements[7] * sourceElements[9];
        inverse[12] =
            -sourceElements[4] * sourceElements[9] * sourceElements[14] +
            sourceElements[4] * sourceElements[10] * sourceElements[13] +
            sourceElements[8] * sourceElements[5] * sourceElements[14] -
            sourceElements[8] * sourceElements[6] * sourceElements[13] -
            sourceElements[12] * sourceElements[5] * sourceElements[10] +
            sourceElements[12] * sourceElements[6] * sourceElements[9];

        inverse[1] =
            -sourceElements[1] * sourceElements[10] * sourceElements[15] +
            sourceElements[1] * sourceElements[11] * sourceElements[14] +
            sourceElements[9] * sourceElements[2] * sourceElements[15] -
            sourceElements[9] * sourceElements[3] * sourceElements[14] -
            sourceElements[13] * sourceElements[2] * sourceElements[11] +
            sourceElements[13] * sourceElements[3] * sourceElements[10];
        inverse[5] =
            sourceElements[0] * sourceElements[10] * sourceElements[15] -
            sourceElements[0] * sourceElements[11] * sourceElements[14] -
            sourceElements[8] * sourceElements[2] * sourceElements[15] +
            sourceElements[8] * sourceElements[3] * sourceElements[14] +
            sourceElements[12] * sourceElements[2] * sourceElements[11] -
            sourceElements[12] * sourceElements[3] * sourceElements[10];
        inverse[9] =
            -sourceElements[0] * sourceElements[9] * sourceElements[15] +
            sourceElements[0] * sourceElements[11] * sourceElements[13] +
            sourceElements[8] * sourceElements[1] * sourceElements[15] -
            sourceElements[8] * sourceElements[3] * sourceElements[13] -
            sourceElements[12] * sourceElements[1] * sourceElements[11] +
            sourceElements[12] * sourceElements[3] * sourceElements[9];
        inverse[13] =
            sourceElements[0] * sourceElements[9] * sourceElements[14] -
            sourceElements[0] * sourceElements[10] * sourceElements[13] -
            sourceElements[8] * sourceElements[1] * sourceElements[14] +
            sourceElements[8] * sourceElements[2] * sourceElements[13] +
            sourceElements[12] * sourceElements[1] * sourceElements[10] -
            sourceElements[12] * sourceElements[2] * sourceElements[9];

        inverse[2] =
            sourceElements[1] * sourceElements[6] * sourceElements[15] -
            sourceElements[1] * sourceElements[7] * sourceElements[14] -
            sourceElements[5] * sourceElements[2] * sourceElements[15] +
            sourceElements[5] * sourceElements[3] * sourceElements[14] +
            sourceElements[13] * sourceElements[2] * sourceElements[7] -
            sourceElements[13] * sourceElements[3] * sourceElements[6];
        inverse[6] =
            -sourceElements[0] * sourceElements[6] * sourceElements[15] +
            sourceElements[0] * sourceElements[7] * sourceElements[14] +
            sourceElements[4] * sourceElements[2] * sourceElements[15] -
            sourceElements[4] * sourceElements[3] * sourceElements[14] -
            sourceElements[12] * sourceElements[2] * sourceElements[7] +
            sourceElements[12] * sourceElements[3] * sourceElements[6];
        inverse[10] =
            sourceElements[0] * sourceElements[5] * sourceElements[15] -
            sourceElements[0] * sourceElements[7] * sourceElements[13] -
            sourceElements[4] * sourceElements[1] * sourceElements[15] +
            sourceElements[4] * sourceElements[3] * sourceElements[13] +
            sourceElements[12] * sourceElements[1] * sourceElements[7] -
            sourceElements[12] * sourceElements[3] * sourceElements[5];
        inverse[14] =
            -sourceElements[0] * sourceElements[5] * sourceElements[14] +
            sourceElements[0] * sourceElements[6] * sourceElements[13] +
            sourceElements[4] * sourceElements[1] * sourceElements[14] -
            sourceElements[4] * sourceElements[2] * sourceElements[13] -
            sourceElements[12] * sourceElements[1] * sourceElements[6] +
            sourceElements[12] * sourceElements[2] * sourceElements[5];

        inverse[3] =
            -sourceElements[1] * sourceElements[6] * sourceElements[11] +
            sourceElements[1] * sourceElements[7] * sourceElements[10] +
            sourceElements[5] * sourceElements[2] * sourceElements[11] -
            sourceElements[5] * sourceElements[3] * sourceElements[10] -
            sourceElements[9] * sourceElements[2] * sourceElements[7] +
            sourceElements[9] * sourceElements[3] * sourceElements[6];
        inverse[7] =
            sourceElements[0] * sourceElements[6] * sourceElements[11] -
            sourceElements[0] * sourceElements[7] * sourceElements[10] -
            sourceElements[4] * sourceElements[2] * sourceElements[11] +
            sourceElements[4] * sourceElements[3] * sourceElements[10] +
            sourceElements[8] * sourceElements[2] * sourceElements[7] -
            sourceElements[8] * sourceElements[3] * sourceElements[6];
        inverse[11] =
            -sourceElements[0] * sourceElements[5] * sourceElements[11] +
            sourceElements[0] * sourceElements[7] * sourceElements[9] +
            sourceElements[4] * sourceElements[1] * sourceElements[11] -
            sourceElements[4] * sourceElements[3] * sourceElements[9] -
            sourceElements[8] * sourceElements[1] * sourceElements[7] +
            sourceElements[8] * sourceElements[3] * sourceElements[5];
        inverse[15] =
            sourceElements[0] * sourceElements[5] * sourceElements[10] -
            sourceElements[0] * sourceElements[6] * sourceElements[9] -
            sourceElements[4] * sourceElements[1] * sourceElements[10] +
            sourceElements[4] * sourceElements[2] * sourceElements[9] +
            sourceElements[8] * sourceElements[1] * sourceElements[6] -
            sourceElements[8] * sourceElements[2] * sourceElements[5];

        let det;
        det = sourceElements[0] * inverse[0] + sourceElements[1] * inverse[4] + sourceElements[2] * inverse[8] + sourceElements[3] * inverse[12];
        if (det === 0) {
            return this;
        }

        det = 1 / det;
        for (let i = 0; i < 16; i++) {
            elements[i] = inverse[i] * det;
        }

        return this;
    }

    /**
     * Calculate the inverse matrix of this, and set to this.
     * @return this
     */
    invert() {
        return this.setInverseOf(this);
    }

    /**
     * Set the orthographic projection matrix.
     * @param left The coordinate of the left of clipping plane.
     * @param right The coordinate of the right of clipping plane.
     * @param bottom The coordinate of the bottom of clipping plane.
     * @param top The coordinate of the top top clipping plane.
     * @param near The distances to the nearer depth clipping plane. This value is minus if the plane is to be behind the viewer.
     * @param far The distances to the farther depth clipping plane. This value is minus if the plane is to be behind the viewer.
     * @return this
     */
    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        if (left === right || bottom === top || near === far) {
            throw `null frustum : ${JSON.stringify({ left, right, bottom, top, near, far })}`;
        }

        const rw = 1 / (right - left);
        const rh = 1 / (top - bottom);
        const rd = 1 / (far - near);

        const elements = this.elements;

        elements[0] = 2 * rw;
        elements[1] = 0;
        elements[2] = 0;
        elements[3] = 0;

        elements[4] = 0;
        elements[5] = 2 * rh;
        elements[6] = 0;
        elements[7] = 0;

        elements[8] = 0;
        elements[9] = 0;
        elements[10] = -2 * rd;
        elements[11] = 0;

        elements[12] = -(right + left) * rw;
        elements[13] = -(top + bottom) * rh;
        elements[14] = -(far + near) * rd;
        elements[15] = 1;

        return this;
    }

    /**
     * Multiply the orthographic projection matrix from the right.
     * @param left The coordinate of the left of clipping plane.
     * @param right The coordinate of the right of clipping plane.
     * @param bottom The coordinate of the bottom of clipping plane.
     * @param top The coordinate of the top top clipping plane.
     * @param near The distances to the nearer depth clipping plane. This value is minus if the plane is to be behind the viewer.
     * @param far The distances to the farther depth clipping plane. This value is minus if the plane is to be behind the viewer.
     * @return this
     */
    ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        return this.concat(new Matrix4().setOrtho(left, right, bottom, top, near, far));
    }

    /**
     * Set the perspective projection matrix.
     * @param left The coordinate of the left of clipping plane.
     * @param right The coordinate of the right of clipping plane.
     * @param bottom The coordinate of the bottom of clipping plane.
     * @param top The coordinate of the top top clipping plane.
     * @param near The distances to the nearer depth clipping plane. This value must be plus value.
     * @param far The distances to the farther depth clipping plane. This value must be plus value.
     * @return this
     */
    setFrustum(left, right, bottom, top, near, far) {
        if (left === right || top === bottom || near === far) {
            throw "null frustum";
        }
        if (near <= 0) {
            throw "near <= 0";
        }
        if (far <= 0) {
            throw "far <= 0";
        }

        const rw = 1 / (right - left);
        const rh = 1 / (top - bottom);
        const rd = 1 / (far - near);

        const e = this.elements;

        e[0] = 2 * near * rw;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;

        e[4] = 0;
        e[5] = 2 * near * rh;
        e[6] = 0;
        e[7] = 0;

        e[8] = (right + left) * rw;
        e[9] = (top + bottom) * rh;
        e[10] = -(far + near) * rd;
        e[11] = -1;

        e[12] = 0;
        e[13] = 0;
        e[14] = -2 * near * far * rd;
        e[15] = 0;

        return this;
    }

    /**
     * Multiply the perspective projection matrix from the right.
     * @param left The coordinate of the left of clipping plane.
     * @param right The coordinate of the right of clipping plane.
     * @param bottom The coordinate of the bottom of clipping plane.
     * @param top The coordinate of the top top clipping plane.
     * @param near The distances to the nearer depth clipping plane. This value must be plus value.
     * @param far The distances to the farther depth clipping plane. This value must be plus value.
     * @return this
     */
    frustum(left, right, bottom, top, near, far) {
        return this.concat(new Matrix4().setFrustum(left, right, bottom, top, near, far));
    }
    /**
     * 透视投影
     * Set the perspective projection matrix by fovy and aspect.
     * @param fovY The angle between the upper and lower sides of the frustum.
     * @param aspect The aspect ratio of the frustum. (width/height)
     * @param near The distances to the nearer depth clipping plane. This value must be plus value.
     * @param far The distances to the farther depth clipping plane. This value must be plus value.
     * @return this
     */
    setPerspective(fovY: number, aspect: number, near: number, far: number) {
        if (near === far || aspect === 0) {
            throw "null frustum";
        }
        if (near <= 0) {
            throw "near <= 0";
        }
        if (far <= 0) {
            throw "far <= 0";
        }

        fovY = (Math.PI * fovY) / 180 / 2;
        const s = Math.sin(fovY);
        if (s === 0) {
            throw "null frustum";
        }

        const rd = 1 / (far - near);
        const ct = Math.cos(fovY) / s;

        const elements = this.elements;

        elements[0] = ct / aspect;
        elements[1] = 0;
        elements[2] = 0;
        elements[3] = 0;

        elements[4] = 0;
        elements[5] = ct;
        elements[6] = 0;
        elements[7] = 0;

        elements[8] = 0;
        elements[9] = 0;
        elements[10] = -(far + near) * rd;
        elements[11] = -1;

        elements[12] = 0;
        elements[13] = 0;
        elements[14] = -2 * near * far * rd;
        elements[15] = 0;

        return this;
    }

    /**
     * Multiply the perspective projection matrix from the right.
     * @param fovY The angle between the upper and lower sides of the frustum.
     * @param aspect The aspect ratio of the frustum. (width/height)
     * @param near The distances to the nearer depth clipping plane. This value must be plus value.
     * @param far The distances to the farther depth clipping plane. This value must be plus value.
     * @return this
     */
    perspective(fovY: number, aspect: number, near: number, far: number) {
        return this.concat(new Matrix4().setPerspective(fovY, aspect, near, far));
    }

    /**
     * 将Matrix4实例设置缩放变换矩阵
     * Set the matrix for scaling.
     * @param x The scale factor along the X axis
     * @param y The scale factor along the Y axis
     * @param z The scale factor along the Z axis
     * @return this
     */
    setScale(x: number, y: number, z: number) {
        x = parseFloat(x + "");
        y = parseFloat(y + "");
        z = parseFloat(z + "");
        const elements = this.elements;
        elements[0] = x;
        elements[4] = 0;
        elements[8] = 0;
        elements[12] = 0;
        elements[1] = 0;
        elements[5] = y;
        elements[9] = 0;
        elements[13] = 0;
        elements[2] = 0;
        elements[6] = 0;
        elements[10] = z;
        elements[14] = 0;
        elements[3] = 0;
        elements[7] = 0;
        elements[11] = 0;
        elements[15] = 1;
        return this;
    }

    /**
     * 将matrix4实例乘以一个缩放变换矩阵
     * Multiply the matrix for scaling from the right.
     * @param x The scale factor along the X axis
     * @param y The scale factor along the Y axis
     * @param z The scale factor along the Z axis
     * @return this
     */
    scale(x: number, y: number, z: number) {
        x = parseFloat(x + "");
        y = parseFloat(y + "");
        z = parseFloat(z + "");
        const elements = this.elements;
        elements[0] *= x;
        elements[4] *= y;
        elements[8] *= z;
        elements[1] *= x;
        elements[5] *= y;
        elements[9] *= z;
        elements[2] *= x;
        elements[6] *= y;
        elements[10] *= z;
        elements[3] *= x;
        elements[7] *= y;
        elements[11] *= z;
        return this;
    }

    /**
     * 将Matrix4实例设置平移变换矩阵
     * Set the matrix for translation.
     * @param x The X value of a translation.
     * @param y The Y value of a translation.
     * @param z The Z value of a translation.
     * @return this
     */
    setTranslate(x: number, y: number, z: number) {
        x = parseFloat(x + "");
        y = parseFloat(y + "");
        z = parseFloat(z + "");

        const elements = this.elements;
        elements[0] = 1;
        elements[4] = 0;
        elements[8] = 0;
        elements[12] = x;
        elements[1] = 0;
        elements[5] = 1;
        elements[9] = 0;
        elements[13] = y;
        elements[2] = 0;
        elements[6] = 0;
        elements[10] = 1;
        elements[14] = z;
        elements[3] = 0;
        elements[7] = 0;
        elements[11] = 0;
        elements[15] = 1;
        return this;
    }

    /**
     * 将matrix4实例乘以一个平移变换矩阵
     * Multiply the matrix for translation from the right.
     * @param x The X value of a translation.
     * @param y The Y value of a translation.
     * @param z The Z value of a translation.
     * @return this
     */
    translate(x: number, y: number, z: number) {
        const elements = this.elements;
        x = x ?? 1;
        y = y ?? 1;
        z = z ?? 1;
        elements[12] += elements[0] * x + elements[4] * y + elements[8] * z;
        elements[13] += elements[1] * x + elements[5] * y + elements[9] * z;
        elements[14] += elements[2] * x + elements[6] * y + elements[10] * z;
        elements[15] += elements[3] * x + elements[7] * y + elements[11] * z;
        return this;
    }

    /**
     * 将Matrix4实例设置旋转变换矩阵
     * Set the matrix for rotation.
     * The vector of rotation axis may not be normalized.
     * @param degrees The angle of rotation (degrees)
     * @param x The X coordinate of vector of rotation axis.
     * @param y The Y coordinate of vector of rotation axis.
     * @param z The Z coordinate of vector of rotation axis.
     * @return this
     */
    setRotate(degrees: number, x: number, y: number, z: number) {
        const angle = (Math.PI * degrees) / 180;
        const elements = this.elements;

        let sin = Math.sin(angle);
        const cos = Math.cos(angle);

        /**
         * | 1    0       0       0 |   | x |
         * | 0    cos     sin     0 |   | y |
         * | 0    -sin    cos     0 | * | z |
         * | 0    0       0       1 |   | w |
         */
        if (x !== 0 && y === 0 && z === 0) {
            // Rotation around X axis
            if (x < 0) sin = -sin;
            elements[0] = 1;
            elements[4] = 0;
            elements[8] = 0;
            elements[12] = 0;

            elements[1] = 0;
            elements[5] = cos;
            elements[9] = -sin;
            elements[13] = 0;
            elements[2] = 0;
            elements[6] = sin;
            elements[10] = cos;
            elements[14] = 0;
            elements[3] = 0;
            elements[7] = 0;
            elements[11] = 0;
            elements[15] = 1;
        } else if (x === 0 && y !== 0 && z === 0) {
            // Rotation around Y axis
            if (y < 0) sin = -sin;
            elements[0] = cos;
            elements[4] = 0;
            elements[8] = sin;
            elements[12] = 0;
            elements[1] = 0;
            elements[5] = 1;
            elements[9] = 0;
            elements[13] = 0;
            elements[2] = -sin;
            elements[6] = 0;
            elements[10] = cos;
            elements[14] = 0;
            elements[3] = 0;
            elements[7] = 0;
            elements[11] = 0;
            elements[15] = 1;
        } else if (x === 0 && y === 0 && z !== 0) {
            // Rotation around Z axis
            if (z < 0) sin = -sin;
            elements[0] = cos;
            elements[4] = -sin;
            elements[8] = 0;
            elements[12] = 0;
            elements[1] = sin;
            elements[5] = cos;
            elements[9] = 0;
            elements[13] = 0;
            elements[2] = 0;
            elements[6] = 0;
            elements[10] = 1;
            elements[14] = 0;
            elements[3] = 0;
            elements[7] = 0;
            elements[11] = 0;
            elements[15] = 1;
        } else {
            // Rotation around another axis
            const len = Math.sqrt(x * x + y * y + z * z);
            if (len !== 1) {
                const rlen = 1 / len;
                x *= rlen;
                y *= rlen;
                z *= rlen;
            }
            let nc = 1 - cos;
            let xy = x * y;
            let yz = y * z;
            let zx = z * x;
            let xs = x * sin;
            let ys = y * sin;
            let zs = z * sin;

            elements[0] = x * x * nc + cos;
            elements[1] = xy * nc + zs;
            elements[2] = zx * nc - ys;
            elements[3] = 0;

            elements[4] = xy * nc - zs;
            elements[5] = y * y * nc + cos;
            elements[6] = yz * nc + xs;
            elements[7] = 0;

            elements[8] = zx * nc + ys;
            elements[9] = yz * nc - xs;
            elements[10] = z * z * nc + cos;
            elements[11] = 0;

            elements[12] = 0;
            elements[13] = 0;
            elements[14] = 0;
            elements[15] = 1;
        }

        return this;
    }

    /**
     * 将matrix4实例乘以一个旋转变换矩阵
     * Multiply the matrix for rotation from the right.
     * The vector of rotation axis may not be normalized.
     * @param angle The angle of rotation (degrees)
     * @param x The X coordinate of vector of rotation axis.
     * @param y The Y coordinate of vector of rotation axis.
     * @param z The Z coordinate of vector of rotation axis.
     * @return this
     */
    rotate(angle, x, y, z) {
        return this.concat(new Matrix4().setRotate(angle, x, y, z));
    }

    /**
     * Set the viewing matrix.
     * @param eye Vector3 The position of the eye point.
     * @param center Vector3 The position of the reference point.
     * @param up Vector3 The direction of the up vector.
     * @return this
     */
    setLookAt(eye: Vector3, center: Vector3, up: Vector3) {
        const [eyeX, eyeY, eyeZ] = eye.elements;
        const [centerX, centerY, centerZ] = center.elements;
        const [upX, upY, upZ] = up.elements;

        let fx = centerX - eyeX;
        let fy = centerY - eyeY;
        let fz = centerZ - eyeZ;

        // Normalize f.
        const rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
        fx *= rlf;
        fy *= rlf;
        fz *= rlf;

        // Calculate cross product of f and up.
        let sx = fy * upZ - fz * upY;
        let sy = fz * upX - fx * upZ;
        let sz = fx * upY - fy * upX;

        // Normalize s.
        const rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
        sx *= rls;
        sy *= rls;
        sz *= rls;

        // Calculate cross product of s and f.
        const ux = sy * fz - sz * fy;
        const uy = sz * fx - sx * fz;
        const uz = sx * fy - sy * fx;

        // Set to this.
        const elements = this.elements;
        elements[0] = sx;
        elements[1] = ux;
        elements[2] = -fx;
        elements[3] = 0;

        elements[4] = sy;
        elements[5] = uy;
        elements[6] = -fy;
        elements[7] = 0;

        elements[8] = sz;
        elements[9] = uz;
        elements[10] = -fz;
        elements[11] = 0;

        elements[12] = 0;
        elements[13] = 0;
        elements[14] = 0;
        elements[15] = 1;

        // Translate.
        return this.translate(-eyeX, -eyeY, -eyeZ);
    }

    /**
     * Multiply the viewing matrix from the right.
     * @param eyeX, eyeY, eyeZ The position of the eye point.
     * @param centerX, centerY, centerZ The position of the reference point.
     * @param upX, upY, upZ The direction of the up vector.
     * @return this
     */
    lookAt(eye: Vector3, center: Vector3, up: Vector3) {
        return this.concat(new Matrix4().setLookAt(eye, center, up));
    }

    /**
     * Multiply the matrix for project vertex to plane from the right.
     * @param plane The array[A, B, C, D] of the equation of plane "Ax + By + Cz + D = 0".
     * @param light The array which stored coordinates of the light. if light[3]=0, treated as parallel light.
     * @return this
     */
    dropShadow(plane, light) {
        const mat = new Matrix4();
        const elements = mat.elements;

        const dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];

        elements[0] = dot - light[0] * plane[0];
        elements[1] = -light[1] * plane[0];
        elements[2] = -light[2] * plane[0];
        elements[3] = -light[3] * plane[0];

        elements[4] = -light[0] * plane[1];
        elements[5] = dot - light[1] * plane[1];
        elements[6] = -light[2] * plane[1];
        elements[7] = -light[3] * plane[1];

        elements[8] = -light[0] * plane[2];
        elements[9] = -light[1] * plane[2];
        elements[10] = dot - light[2] * plane[2];
        elements[11] = -light[3] * plane[2];

        elements[12] = -light[0] * plane[3];
        elements[13] = -light[1] * plane[3];
        elements[14] = -light[2] * plane[3];
        elements[15] = dot - light[3] * plane[3];

        return this.concat(mat);
    }

    /**
     * Multiply the matrix for project vertex to plane from the right.(Projected by parallel light.)
     * @param normX, normY, normZ The normal vector of the plane.(Not necessary to be normalized.)
     * @param planeX, planeY, planeZ The coordinate of arbitrary points on a plane.
     * @param lightX, lightY, lightZ The vector of the direction of light.(Not necessary to be normalized.)
     * @return this
     */
    dropShadowDirectionally(normX, normY, normZ, planeX, planeY, planeZ, lightX, lightY, lightZ) {
        const a = planeX * normX + planeY * normY + planeZ * normZ;
        return this.dropShadow([normX, normY, normZ, -a], [lightX, lightY, lightZ, 0]);
    }
}

export {
    //
    Matrix4,
};
