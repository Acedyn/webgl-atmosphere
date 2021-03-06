import * as THREE from 'three'
import sunVertexShader from '../shader/sun.vert'
import sunFragmentShader from '../shader/sun.frag'
import Planet from './planet'

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

            const mesh = new THREE.Mesh(geometry, material)
            return mesh
        }

        this.createStars = (count, size) => {
            // Initialize the array of start location
            const vertices = new Float32Array(count * 3)
            const sprite = new THREE.TextureLoader().load('disc.png');
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
            material.color.setHSL(0.9, 1.0, 1.0);
            material.sizeAttenuation = true
            material.size = 0.15
            material.alphaTest = 0.001
            material.transparent = true
            material.map = sprite;
            return new THREE.Points(geometry, material)
        }

        this.createPlanet = (size) => {
            const mesh = new Planet(size)
            const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.8)
            const group = new THREE.Group()
            group.add(mesh)
            group.add(light)
            group.size = size
            group.randomDistance = Math.random() * 15 + 8
            group.randomAngle = Math.random() * 2 * Math.PI
            group.rotationSpeed = Math.random() * 0.2 + 0.05
            const randomPositionX = Math.sin(group.randomAngle) * group.randomDistance
            const randomPositionZ = Math.cos(group.randomAngle) * group.randomDistance
            group.translateX(randomPositionX)
            group.translateZ(randomPositionZ)
            return group
        }

        this.update = (dt) => {
            this.children.forEach((child) => {
                if (child.type == "Group") {
                    child.randomAngle += child.rotationSpeed * dt
                    const randomPositionX = Math.sin(child.randomAngle) * child.randomDistance
                    const randomPositionZ = Math.cos(child.randomAngle) * child.randomDistance
                    child.position.x = randomPositionX
                    child.position.z = randomPositionZ
                }
            })
        }

        this.getPlanetsInfo = () => {
            const planets = new Array()
            this.children.forEach((child) => {
                if (child.type == "Group") {
                    planets.push(new THREE.Vector4(child.position.x, child.position.y, child.position.z, child.size))
                }
            })
            planets.sort((a, b) => {
                return a.w > b.w;
            })
            return planets
        }

        this.add(this.createSun(3.0))
        this.add(this.createStars(20000, 40))
        this.planets = []
        for (let i = 0; i < 12; i++) {
            const planetSize = Math.random() * 1.5 + 0.2
            this.add(this.createPlanet(planetSize))
        }
    }
}
