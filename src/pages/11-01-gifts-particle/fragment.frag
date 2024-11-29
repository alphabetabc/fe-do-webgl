uniform sampler2D u_Sampler;
uniform float u_Alpha;

varying vec2 v_TexCoord;

void main() {
   gl_FragColor.rgb = texture2D(u_Sampler, vec2(v_TexCoord.s,v_TexCoord.t)).rgb;
   gl_FragColor.a = u_Alpha;
}