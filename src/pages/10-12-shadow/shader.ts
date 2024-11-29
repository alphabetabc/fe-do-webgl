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
                // 片元深度值 
                gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);
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

            void main(){
                /**
                 * 归一化
                 * 这里的归一化方式和z值的归一化方式一致
                 * webgl的可视空间中的xyz坐标都是在[-1, 1]之间，纹理坐标值和纹理像素值的区间都是[0, 1]之间
                 */
                vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
                vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
                // 从RGBA中取出深度值
                float depth = rgbaDepth.r;
                
                // float visibility = smoothstep(shadowCoord.z , shadowCoord.z, depth + 0.005);
                
                
                /**
                 * 加 0.005 是为了防止出现 马赫带(mach band)
                 * 由于深度值的精度问题，所以需要使用一定的偏移量
                 * 偏移量略大约精度
                */
                float visibility = (shadowCoord.z > depth + 0.005) ? 0.5 : 1.0;
                
                // 使用0.0 会出现马赫带
                // float visibility = (shadowCoord.z > depth + 0.0) ? 0.5 : 1.0;
                gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
            }
        `,
    },
};
