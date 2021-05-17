#include <common>
varying vec2 vUv;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec4 planets[PLANET_COUNT] ;

uniform vec3 cameraFront;
uniform vec3 cameraUp;
uniform float nearClip;
uniform float farClip;
uniform float aspect;
uniform float focal;
uniform vec2 filmSize;

#include <packing>
float getDepth( const in vec2 screenPosition ) {
    #if DEPTH_PACKING == 1
    return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
    #else
    return texture2D( tDepth, screenPosition ).x;
    #endif
}
float getViewZ( const in float depth ) {
    #if PERSPECTIVE_CAMERA == 1
    return perspectiveDepthToViewZ( depth, nearClip, farClip );
    #else
    return orthographicDepthToViewZ( depth, nearClip, farClip );
    #endif
}

void main() {
    float viewZ = -perspectiveDepthToViewZ(unpackRGBAToDepth(texture2D( tDepth, vUv )), nearClip, farClip);
    if(viewZ >= 50.0)
    {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    }
    else
    {
        gl_FragColor = vec4(cameraFront, 1.0);
    }
    
    vec2 vUv = vUv - vec2(0.5, 0.5);
    vec3 cameraFront = normalize(cameraFront);
    vec3 cameraUp = normalize(cameraUp);
    vec3 cameraSide = normalize(cross(cameraFront, cameraUp));
    vec3 ray = normalize(cameraFront * focal + (cameraSide * filmSize.x * vUv.x) + (cameraUp * filmSize.y * vUv.y));

    for(int i = 0; i < PLANET_COUNT; i++)
    {
        vec3 spherePosition = vec3(planets[i]);
        float sphereDistance = distance(spherePosition, cameraPosition);
        vec3 sphereDirection = spherePosition - cameraPosition;
        float tangentDistance = dot(sphereDirection, ray);
        float pos = distance(cameraPosition + ray*tangentDistance, spherePosition);
        if(pos < planets[i].w)
        {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    }
}
