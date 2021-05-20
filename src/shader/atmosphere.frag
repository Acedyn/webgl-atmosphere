#include <common>
varying vec2 vUv;
varying vec3 vPosition;
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

float UnpackDepth( in vec2 pack )
{
    float depth = pack.x * 100.0;
    depth += pack.y;
    return depth;
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

    if(sphereDistance < sphereRadius)
    {
        return vec2(min(firstHitDistance, 100.0), -1.0);
    }

    float secondHitDistance = tangentDistance + sqrt(pow(sphereRadius, 2.0) - pow(hitDistance, 2.0));
    return vec2(min(firstHitDistance, 100.0), min(secondHitDistance, depht));
}

float getPointDensity(vec3 pointPosition, vec3 planetPosition, float planetRadius)
{
    float centerDistance = distance(pointPosition, planetPosition);
    return planetRadius - centerDistance;
}

float scatterLight(vec3 rayOrigin, vec3 rayDirection, float rayLenght, int scatterIteration, vec3 planetPosition, float planetRadius, vec3 sunPosition)
{
    vec3 scatterPoint = rayOrigin;
    float stepSize = rayLenght / float(scatterIteration - 1);
    float accumulatedLight = 0.0;
    for(int i = 0; i < scatterIteration; i++)
    {
        // Get the distance from the scatter point to the atmosphere surface along the sun direction
        float sunRayLenght = sphereIntersect(planetPosition, planetRadius, scatterPoint, normalize(scatterPoint - planetPosition), 1000.0).x;
        float localDensity = getPointDensity(scatterPoint, planetPosition, planetRadius);
        // Get the density along the ray that points to the sun
        // Get the density along the ray that points the the camera
        // Get the density of the point
        scatterPoint += normalize(rayDirection) * stepSize;
        accumulatedLight += localDensity * stepSize;
    }
    return accumulatedLight;
}

float getRayDensity(vec3 rayOrigin, vec3 rayDirection, float rayLenght, float planetPosition, float planetRadius)
{
    return 1.0;
}

void main() {
    float viewZ = UnpackDepth(texture2D( tDepth, vUv ).xy);
    viewZ = texture2D( tDepth, vUv ).x * 20.0;
    vec2 vUv = vUv - vec2(0.5, 0.5);
    vec3 cameraFront = normalize(cameraFront);
    vec3 cameraUp = normalize(cameraUp);
    vec3 cameraSide = normalize(cross(cameraFront, cameraUp));
    vec3 ray = normalize(cameraFront * focal + (cameraSide * filmSize.x * vUv.x) + (cameraUp * filmSize.y * vUv.y));

    gl_FragColor = vec4(1.0);
    for(int i = 0; i < PLANET_COUNT; i++)
    {
        float atmosphereRadius = planets[i].w * 1.5;
        vec2 intersection = sphereIntersect(planets[i].xyz, atmosphereRadius, cameraPosition, ray, viewZ);
        vec3 hitPos1 = cameraPosition + ray * intersection.x;
        vec3 hitPos2 = cameraPosition + ray * intersection.y;
        float scatteredLight = scatterLight(hitPos1, ray, intersection.y - intersection.x, 5, planets[i].xyz, planets[i].w, vec3(0.0, 0.0, 0.0));
        if(intersection.x > 0.0)
        {
            gl_FragColor = vec4((intersection.y - intersection.x)/(atmosphereRadius * 2.0), 0.0, 0.0, 1.0);
            // gl_FragColor = vec4(vec3(intersection.x/20.0), 1.0);
            // gl_FragColor = vec4(vec3(viewZ/20.0), 1.0);
        }
    }
}
