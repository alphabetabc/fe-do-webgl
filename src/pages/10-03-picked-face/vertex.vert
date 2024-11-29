uniform mat4 u_MvpMatrix;
uniform int u_PickedFace; // 被选中面的编号

attribute vec4 a_Position; 
attribute vec4 a_Color;
attribute float a_Face; // 面编号，不可以用int 类型，否则会报错

varying vec4 v_Color;

void main(){

    gl_Position = u_MvpMatrix * a_Position;
   

    int face = int(a_Face); // 浮点数转整数
    vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;

    if(u_PickedFace == 0){
        // 把表面编号写入α分量
        v_Color = vec4(color, a_Face / 255.0);
    } else {
        v_Color = vec4(color, a_Color.a);
    }


}