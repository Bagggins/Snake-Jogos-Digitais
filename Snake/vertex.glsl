precision highp float;

attribute vec3 position;
attribute vec3 normal;

uniform float frame;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec4 ponto;
varying vec4 norm;

void main(){

    ponto =  model * vec4(position, 1.0);

    norm = model * vec4(normal.xyz, 0.0);

    gl_Position = projection * view * ponto;
}