uniform sampler2D u_Sampler_BG;
uniform sampler2D u_Sampler_FG;
varying vec2 v_TexCoord;

void main(){
    vec4 bg = texture2D(u_Sampler_BG, v_TexCoord);
    vec4 fg = texture2D(u_Sampler_FG, v_TexCoord);
    gl_FragColor =  fg * bg;
}