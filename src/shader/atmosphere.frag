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
        float sunRayLenght = 1.0- sphereIntersect(planetPosition, planetRadius, scatterPoint, normalize(scatterPoint - sunPosition), 1000.0).x / planetRadius;
        // if(sunRayLenght < 0.0) { sunRayLenght = 0.2; }
        sunRayLenght = 1.0 - pow(sunRayLenght*0.4, 1.0) * 0.8;
        float localDensity = getPointDensity(scatterPoint, planetPosition, planetRadius);
        // Get the density along the ray that points to the sun
        // Get the density along the ray that points the the camera
        // Get the density of the point
        scatterPoint += normalize(rayDirection) * stepSize;
        accumulatedLight += sunRayLenght;
    }
    return accumulatedLight / float(scatterIteration);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float viewZ = UnpackDepth(texture2D( tDepth, vUv ).xy);
    viewZ = texture2D( tDepth, vUv ).x * 20.0;
    vec3 color = texture2D( tColor, vUv ).xyz;
    vec2 vUv = vUv - vec2(0.5, 0.5);
    vec3 cameraFront = normalize(cameraFront);
    vec3 cameraUp = normalize(cameraUp);
    vec3 cameraSide = normalize(cross(cameraFront, cameraUp));
    vec3 ray = normalize(cameraFront * focal + (cameraSide * filmSize.x * vUv.x) + (cameraUp * filmSize.y * vUv.y));

    vec4 outColor = vec4(vec3(color), 1.0);
    for(int i = 0; i < PLANET_COUNT; i++)
    {
        float atmosphereRadius = planets[i].w * 2.0 + 0.2;
        vec2 intersection = sphereIntersect(planets[i].xyz, atmosphereRadius, cameraPosition, ray, viewZ);
        vec3 hitPos1 = cameraPosition + ray * intersection.x;
        vec3 hitPos2 = cameraPosition + ray * intersection.y;
        float scatteredLight = scatterLight(hitPos1, ray, intersection.y - intersection.x, 5, planets[i].xyz, atmosphereRadius, vec3(0.0, 0.0, 0.0));
        if(intersection.x > 0.0 && intersection.x < viewZ)
        {
            vec3 atmosphereColorA = vec3(pow((intersection.y - intersection.x)/(atmosphereRadius * 2.0) * scatteredLight * 2.2, 8.0));
            vec3 atmosphereColorB = vec3(pow(min((intersection.y - intersection.x)/(atmosphereRadius * 2.0), scatteredLight * 2.0), 3.0));
            vec3 atmosphereColor = clamp(mix(atmosphereColorA, atmosphereColorB * 2.0, 0.5), vec3(0.0), vec3(1.0));
            if(rgb2hsv(outColor.xyz).z < atmosphereColor.x)
            {
                outColor = mix(vec4(atmosphereColor, 1.0), outColor, 0.5);
            }
            //outColor = mix(vec4(vec3(atmosphereColor), 1.0), outColor, 0.5);
            //outColor = vec4(vec3(atmosphereColor), 1.0);
            // gl_FragColor = vec4(vec3(intersection.x/20.0), 1.0);
            // gl_FragColor = vec4(vec3(viewZ/20.0), 1.0);
        }
    }
    gl_FragColor = outColor;
}
