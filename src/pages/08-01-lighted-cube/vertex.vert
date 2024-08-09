
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal; // 法向量

varying vec4 v_Color;

uniform vec3 u_LightColor; // 灯光颜色
uniform vec3 u_LightDirection; // 灯光方向
uniform mat4 u_MvpMatrix;

void main(){
    gl_Position = u_MvpMatrix * a_Position;

    // 法向量归一化
    vec3 nomral = normalize(vec3(a_Normal));

    // 计算光线方向和法向量的点积
    // 单位向量的点积 = cos(角度)
    float nDotL = max(dot(u_LightDirection,nomral),0.0);

    // 反射光
    vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;

    v_Color = vec4(diffuse, a_Color.a);
}