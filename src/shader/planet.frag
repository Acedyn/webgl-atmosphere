precision mediump float;
varying vec3 vNormal;
varying vec3 vColor;
uniform mat4 modelMatrix;
uniform vec3 sunPosition;

void main()
{
    vec3 objectPosition = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
    vec3 sunDirection = normalize(objectPosition - sunPosition);
    float angle = (dot(vNormal, sunDirection) + 1.0) * 0.5;
    angle = pow(angle, 1.0);
    vec3 colorA = vec3(0.72, 0.80, 0.31) * vColor;
    vec3 colorB = vec3(0.03, 0.05, 0.1) * vColor;

    gl_FragColor = vec4(mix(colorA, colorB, angle), 1.0);
}

