#include <common>
varying vec2 vUv;
uniform sampler2D tColor;
uniform sampler2D tDepth;

uniform vec3 cameraFront;
uniform vec3 cameraUp;
uniform float nearClip;
uniform float farClip;
uniform float aspect;
uniform float focal;
uniform float filmWidth;
uniform float filmHeight;

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

    vec3 ray = cameraFront * focal;
}
