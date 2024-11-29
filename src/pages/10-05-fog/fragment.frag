
uniform vec3 u_FogColor; // 雾的颜色
uniform vec2 u_FogDist; // 雾的范围（起点，终点）

varying vec4 v_Color;
varying float v_Dist;

void main(){

    // 雾化因子 
    float fogFactor = clamp((u_FogDist.y - v_Dist)/(u_FogDist.y - u_FogDist.x), 0.0, 1.0);

    // 混合颜色
    // 计算的方程：mix(x, y, a) ===>  x * (1 - a) + y * a
    vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);

    gl_FragColor = vec4(color, v_Color.a);
}