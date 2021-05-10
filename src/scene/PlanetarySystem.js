import * as THREE from 'three'
import sunVertexShader from '../shader/sun.vert'
import sunFragmentShader from '../shader/sun.frag'

export default class PlanetarySystem extends THREE.Group {
    constructor() {
        super()
        this.name = "PlanetarySystem"

        this.createSun = (size) => {
            const geometry = new THREE.SphereBufferGeometry(size, 50, 50)
            const material = new THREE.RawShaderMaterial({
                vertexShader: sunVertexShader,
                fragmentShader: sunFragmentShader
            })

            return new THREE.Mesh(geometry, material)
        }

        this.createStars = (count, size) => {
            // Initialize the array of start location
            const vertices = new Float32Array(count * 3)
            // Get a random location for all the stars
            for (let i = 0; i < count; i++) {
                vertices[i] = (Math.random() - 0.5) * 2 * size
                vertices[i + 1] = (Math.random() - 0.5) * 2 * size
                vertices[i + 2] = (Math.random() - 0.5) * 2 * size
            }
            // Push the vertices to the vertex buffer
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
            // Create the material
            const material = new THREE.PointsMaterial({color: 0x888888})
            return new THREE.Points(geometry, material)
        }

        this.add(this.createSun(1))
    }
}
