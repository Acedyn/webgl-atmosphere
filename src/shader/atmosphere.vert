varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = -(modelViewMatrix * vec4(position.xyz, 1.)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
