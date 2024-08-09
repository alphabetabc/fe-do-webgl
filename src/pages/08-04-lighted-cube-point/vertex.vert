
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal; // 法向量

varying vec4 v_Color;

uniform vec3 u_LightColor; // 灯光颜色
uniform vec3 u_LightPosition; // 灯光位置
uniform vec3 u_AmbientLight; // 环境光

uniform mat4 u_ModelMatrix; // 模型矩阵
uniform mat4 u_NormalMatrix; // 逆转置矩阵，用来变换法向量的矩阵
uniform mat4 u_MvpMatrix;

void main(){
    gl_Position = u_MvpMatrix * a_Position;

    // 法向量归一化
    // 使用逆转置矩阵计算变换之后的法向量
    vec3 nomral = normalize(vec3(u_NormalMatrix * a_Normal));

    // 计算顶点的世界坐标系
    vec4 vertexWorldPosition = u_ModelMatrix * a_Position;

    // 计算光线方向并归一化
    vec3 lightDirection = normalize(u_LightPosition - vec3(vertexWorldPosition));

    // 计算光线方向和法向量的点积
    // 单位向量的点积 = cos(角度)
    float nDotL = max(dot(lightDirection, nomral), 0.0);

    // 反射光
    // <漫反射光颜色> = <入射光颜色> x <表面基底色> x cos(θ)
    // <漫反射光颜色> = <入射光颜色> x <表面基底色> x (<光线方向>·<法线方向>)
    vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;

    // <表面的反射光颜色> = <漫反射光颜色> + <环境反色光颜色>
    v_Color = vec4(diffuse + u_AmbientLight, a_Color.a);
}