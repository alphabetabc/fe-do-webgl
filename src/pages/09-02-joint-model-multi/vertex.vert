attribute vec4 a_Position;
attribute vec4 a_Normal;

uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix;

varying vec4 v_Color;

void main(){

    gl_Position = u_MvpMatrix * a_Position;

    vec4 color = vec4(0.0, 0.8, 0.2, 1.0); // 物体颜色

    // 平行光
    vec3 lightDirection = normalize(vec3(0.0, 0.5, .7)); // 光方向
    vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
   
    // 计算反射
    vec3 nomral = normalize(vec3(u_NormalMatrix * a_Normal));  
    float nDotL = max(dot(nomral, lightDirection), 0.0);
    vec3 diffuse = lightColor.rgb * color.rgb * nDotL;
    
    vec3 ambient = vec3(0.2);

    v_Color = vec4(diffuse + ambient, color.a);

}