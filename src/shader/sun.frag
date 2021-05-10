precision mediump float;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec3 vNormal;

void main()
{
    vec3 cameraPosition = vec3(viewMatrix[3][0], viewMatrix[3][1], viewMatrix[3][2]);
    vec3 objectPosition = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
    vec3 cameraDirection = normalize(objectPosition - cameraPosition);

    float angle = (dot(vNormal, cameraDirection) + 1.0) * 0.5;
    angle = pow(angle, 2.0);
    vec3 colorA = vec3(1.0, 0.0, 0.0);
    vec3 colorB = vec3(0.0, 0.0, 1.0);
    gl_FragColor = vec4(mix(colorA, colorB, angle), 1.0);
}
