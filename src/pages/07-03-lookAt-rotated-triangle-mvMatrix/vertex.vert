
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;

uniform mat4 u_ModelViewMatrix;

void main(){
    v_Color = a_Color;
    gl_Position = u_ModelViewMatrix * a_Position;
}