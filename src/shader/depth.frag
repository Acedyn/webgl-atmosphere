precision mediump float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform mat4 modelMatrix;
uniform vec3 cameraPosition;

void main()
{
    gl_FragColor = vec4(vec3(distance(vPosition, cameraPosition)), 1.0);
}

