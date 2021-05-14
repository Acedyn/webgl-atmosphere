precision mediump float;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec3 cameraPosition;
varying vec3 vNormal;

void main()
{
    vec3 objectPosition = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
    vec3 cameraDirection = normalize(cameraPosition - objectPosition);

    float angle = (dot(vNormal, cameraDirection) + 1.0) * 0.5;
    angle = pow(angle, 5.0);
    vec3 colorA = vec3(0.92, 0.68, 0.01);
    vec3 colorB = vec3(0.95, 0.37, 0.01);
    gl_FragColor = vec4(mix(colorA, colorB, angle), 1.0);
}
