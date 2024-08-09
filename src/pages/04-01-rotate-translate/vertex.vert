
attribute vec4 a_Position;
// 模型变换矩阵
uniform mat4 u_ModelMatrix;

void main(){
    gl_Position = u_ModelMatrix * a_Position;
    gl_PointSize = 10.0;
}