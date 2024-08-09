uniform vec3 u_LightColor; // 灯光颜色
uniform vec3 u_LightPosition; // 灯光位置
uniform vec3 u_AmbientLight; // 环境光

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec4 v_Color;

void main(){

    // 重新归一化，插值之后不一定是单位向量
    vec3 nomral = normalize(v_Normal);

      // 计算光线方向并归一化
    vec3 lightDirection = normalize(u_LightPosition - v_Position);

    // 计算光线方向和法向量的点积
    // 单位向量的点积 = cos(角度)
    float nDotL = max(dot(lightDirection, nomral), 0.0);

    // 反射光
    // <漫反射光颜色> = <入射光颜色> x <表面基底色> x cos(θ)
    // <漫反射光颜色> = <入射光颜色> x <表面基底色> x (<光线方向>·<法线方向>)
    vec3 diffuse = u_LightColor * vec3(v_Color) * nDotL;
    
    vec3 ambient = u_AmbientLight * v_Color.rgb;

    // <表面的反射光颜色> = <漫反射光颜色> + <环境反色光颜色>
    gl_FragColor = vec4(diffuse + ambient, v_Color.a);

}