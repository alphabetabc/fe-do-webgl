
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute float a_PointSize;
varying vec4 v_Color;

void main(){
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
    v_Color = a_Color;
}