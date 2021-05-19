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

vec2 sphereIntersect(vec3 spherePosition, float sphereRadius, vec3 rayOrigin, vec3 rayDirection, float depht)
{
    float sphereDistance = distance(spherePosition, rayOrigin);
    vec3 sphereDirection = spherePosition - rayOrigin;
    float tangentDistance = dot(sphereDirection, normalize(rayDirection));
    float hitDistance = distance(rayOrigin + rayDirection * tangentDistance, spherePosition);

    if(hitDistance > sphereRadius)
    {
        return vec2(-1.0, -1.0);
    }

    float firstHitDistance = tangentDistance - sqrt(pow(sphereRadius, 2.0) - pow(hitDistance, 2.0));
    float secondHitDistance = tangentDistance + sqrt(pow(sphereRadius, 2.0) - pow(hitDistance, 2.0));
    return vec2(min(firstHitDistance, depht), min(secondHitDistance, depht));
}

float scatterLight(vec3 rayOrigin, vec3 rayDirection, float rayLenght, int scatterIteration, vec3 planetPosition, float planetRadius, vec3 sunPosition)
{
    vec3 scatterPoint = rayOrigin;
    float stepSize = rayLenght / float(scatterIteration - 1);
    for(int i = 0; i < scatterIteration; i++)
    {
        // Get the distance from the scatter point to the atmosphere surface along the sun direction
        // float sunRayLenght = sphereIntersect(planetPosition, planetRadius, scatterPoint, normalize(scatterPoint - planetPosition), 1000.0).x;
        // Get the density along the ray that points to the sun
        // Get the density along the ray that points the the camera
        // Get the density of the point
        scatterPoint += normalize(rayDirection) * stepSize;
    }
    return 1.0;
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
        float atmosphereRadius = planets[i].w * 1.5;
        vec2 intersection = sphereIntersect(vec3(planets[i]), atmosphereRadius, cameraPosition, ray, viewZ);
        if(intersection.x > 0.0)
        {
            gl_FragColor = vec4((intersection.y - intersection.x)/(atmosphereRadius * 2.0), 0.0, 0.0, 1.0);
        }
    }
}
