export const shaderSource = {
    shadow: {
        vertexSource: `
            attribute vec4 a_Position;
            uniform mat4 u_MvpMatrix;

            void main() {
                gl_Position = u_MvpMatrix * a_Position;
            }
        `,
        fragmentSource: `
            void main() {
                const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
                const vec4 bitMask  = vec4(1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0, 0.0);

                /**
                 * 将片元深度值转换为r、g、b、a四个字节
                 * 深度值z被编译为 RGBA 颜色值
                 * - 将大于 1/256 的部分存储在R分量中
                 * - 将 1/256 ~ 1/(256*256) 的部分存储到G分量中
                 * - 将 1/(256*256) ~ 1/(256*256*256) 的部分存储到B分量中
                 * - 将小于 1/(256*256*256) 的部分存储到A分量中
                 */
                vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);

                // 分量调制
                rgbaDepth -= rgbaDepth.gbaa * bitMask;

                // 片元深度值 
                gl_FragColor = rgbaDepth;
            } 
        `,
    },

    normal: {
        vertexSource: `
            attribute vec4 a_Position;
            attribute vec4 a_Color;

            uniform mat4 u_MvpMatrix;
            uniform mat4 u_MvpMatrixFromLight;

            varying vec4 v_PositionFromLight;
            varying vec4 v_Color;

            void main() {
                gl_Position = u_MvpMatrix * a_Position;
                v_PositionFromLight = u_MvpMatrixFromLight * a_Position;
                v_Color = a_Color;
            }
        `,
        fragmentSource: `
            uniform sampler2D u_ShadowMap;

            varying vec4 v_PositionFromLight;
            varying vec4 v_Color;

            // 还原高精度z值
            float unpackDepth(const in vec4 rgbaDepth){
                const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
                float depth = dot(rgbaDepth, bitShift);
                return depth;
            }

            void main(){
                /**
                 * 归一化
                 * 这里的归一化方式和z值的归一化方式一致
                 * webgl的可视空间中的xyz坐标都是在[-1, 1]之间，纹理坐标值和纹理像素值的区间都是[0, 1]之间
                 */
                vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
                vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
                // 重新计算z值
                float depth = unpackDepth(rgbaDepth);
                
                /**
                 * 2e-10 = 0.000976563
                 * 加 0.0015 是为了防止出现 马赫带(mach band)
                 * 由于深度值的精度问题，所以需要使用一定的偏移量
                 * 偏移量略大约精度
                */
                float visibility = (shadowCoord.z > depth + 0.0015) ? 0.7 : 1.0;
                
                gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
            }
        `,
    },
};
