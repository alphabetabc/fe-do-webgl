
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;

uniform mat4 u_ViewMatrix;

void main(){
    v_Color = a_Color;
    gl_Position = u_ViewMatrix * a_Position;
}