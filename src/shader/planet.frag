precision mediump float;
varying vec3 vNormal;
uniform mat4 modelMatrix;
uniform vec3 sunPosition;

void main()
{
    vec3 objectPosition = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
    vec3 sunDirection = normalize(objectPosition - sunPosition);
    float angle = (dot(vNormal, sunDirection) + 1.0) * 0.5;
    angle = pow(angle, 1.0);
    vec3 colorA = vec3(0.72, 0.58, 0.31);
    vec3 colorB = vec3(0.05, 0.09, 0.19);

    gl_FragColor = vec4(mix(colorA, colorB, angle), 1.0);
}

