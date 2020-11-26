precision highp float;

uniform float frame;

varying vec4 ponto;
varying vec4 norm;

void main(){
    vec4 lightA = vec4(6.0, -10.0, 3.0, 1.0);
    vec4 lightB = vec4(-6.0, 1.0, 3.0, 1.0);

    vec4 LA = normalize(lightA - ponto);
    vec4 LB = normalize(lightB - ponto);

    vec4 N = normalize(norm);

    float lambertA = max(dot(LA, N), 0.0);
    float lambertB = max(dot(LB, N), 0.0);

    float ambient = 0.3;


    vec3 colorDifA = vec3(1.0,0.8,0.0);
    vec3 colorDifB = vec3(0.0,1.0,1.0);
    vec3 colorAmb = vec3(1.0,0.0,1.0);

    
    vec3 shadeDif =  (colorDifA * lambertA)+ (colorDifB * lambertB);
    vec3 shadeAmb =  colorAmb * ambient;

    vec3 shade = max(shadeDif, shadeAmb);


    // RGBA
    gl_FragColor = vec4(shade.rgb, 1.0);
}