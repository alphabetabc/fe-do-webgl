
attribute vec4 a_Position; 
attribute vec4 a_Color;

uniform mat4 u_MvpMatrix;

varying vec4 v_Color;
varying float v_Dist;

void main(){

    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;

    // 使用gl_Position.w作为距离，用于计算渐变
    v_Dist = gl_Position.w;
}