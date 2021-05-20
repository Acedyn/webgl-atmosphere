precision mediump float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform mat4 modelMatrix;
uniform vec3 cameraPosition;

vec2 PackDepth( float depth )
{
    float rValue = floor(depth)/100.0;
    float gValue = fract(depth);
    return vec2(rValue, gValue);
}

void main()
{
    float depth = distance(vPosition, cameraPosition);
    gl_FragColor = vec4(vec3(PackDepth(depth), 1.0), 1.0);
    // gl_FragColor = vec4(vec3(depth/20.0), 1.0);
}

