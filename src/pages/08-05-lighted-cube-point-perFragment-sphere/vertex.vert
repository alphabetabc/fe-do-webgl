
attribute vec4 a_Position;
attribute vec4 a_Normal; // 法向量

uniform mat4 u_ModelMatrix; // 模型矩阵
uniform mat4 u_NormalMatrix; // 用来变换法向量的矩阵
uniform mat4 u_MvpMatrix;
uniform vec4 u_Color;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec4 v_Color;

void main(){
    gl_Position = u_MvpMatrix * a_Position;

    // 计算顶点的世界坐标系
    vec4 vertexWorldPosition = u_ModelMatrix * a_Position;
    v_Position = vec3(vertexWorldPosition);

    // 法向量归一化
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
  
    v_Color = u_Color;
}