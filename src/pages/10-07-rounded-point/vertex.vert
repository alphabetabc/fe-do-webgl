attribute vec4 a_Position;
attribute vec3 a_Color;

varying vec3 v_Color;

void main(){
    gl_Position = a_Position;
    gl_PointSize = 50.0;
    v_Color = a_Color;
}