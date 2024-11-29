uniform sampler2D u_Texture;
varying vec2 v_TexCoord;
varying float v_NDotL;

void main() {
    vec4 color = texture2D(u_Texture, v_TexCoord);
    gl_FragColor = vec4(color.rgb * v_NDotL, 1.0);
}