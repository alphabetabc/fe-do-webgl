uniform mat4 u_PerspectiveMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;

attribute vec4 a_Position;
attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;

void main() {
    mat4 modelViewMatrix = u_ViewMatrix * u_ModelMatrix;
    gl_Position = u_PerspectiveMatrix * modelViewMatrix * a_Position;
    v_TexCoord = a_TexCoord;
}