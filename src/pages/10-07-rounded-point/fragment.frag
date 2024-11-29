varying vec3 v_Color;

void main(){

    float dist = distance(gl_PointCoord, vec2(0.5));

    if(dist < 0.5){
        gl_FragColor = vec4(v_Color, 1.0);
    }else{
        discard;
    }

}