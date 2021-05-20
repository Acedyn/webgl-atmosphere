import * as THREE from 'three'
import perlinNoise3D from '../utils/noise'
import planetVertexShader from '../shader/planet.vert'
import planetFragmentShader from '../shader/planet.frag'

export default class Planet extends THREE.Mesh {
    constructor(size) {
        super()

        this.generateHeight = () => {
            for (let i = 0; i < this.geometry.attributes.position.count * 3; i += 3) {
                const position = new THREE.Vector3(0, 0, 0)
                position.x = this.geometry.attributes.position.array[i]
                position.y = this.geometry.attributes.position.array[i + 1]
                position.z = this.geometry.attributes.position.array[i + 2]

                const clamp = 0.1
                const amplitude = Math.min(Math.max(perlinNoise3D(position, 4, 2).multiplyScalar(0.2).x, clamp, 0.0))

                const normalX = this.geometry.attributes.normal.array[i]
                this.geometry.attributes.position.array[i] += normalX * amplitude
                const normalY = this.geometry.attributes.normal.array[i + 1]
                this.geometry.attributes.position.array[i + 1] += normalY * amplitude
                const normalZ = this.geometry.attributes.normal.array[i + 2]
                this.geometry.attributes.position.array[i + 2] += normalZ * amplitude
                if (amplitude == clamp) {
                    this.geometry.attributes.color.array[i] = 0.4
                    this.geometry.attributes.color.array[i + 1] = 0.8
                    this.geometry.attributes.color.array[i + 2] = 1.5
                }
                else {
                    this.geometry.attributes.color.array[i] = 1.0
                    this.geometry.attributes.color.array[i + 1] = 1.0
                    this.geometry.attributes.color.array[i + 2] = 1.0
                }
            }
        }

        this.geometry = new THREE.SphereBufferGeometry(size, 100, 100)
        this.color = new THREE.BufferAttribute(new Float32Array(this.geometry.attributes.position.count * 3), 3)
        this.geometry.setAttribute("color", this.color)
        this.generateHeight()
        this.geometry.computeVertexNormals()
        this.uniforms = {
            sunPosition: new THREE.Uniform(new THREE.Vector3(0.0, 0.0, 0.0))
        }
        this.material = new THREE.RawShaderMaterial({
            vertexShader: planetVertexShader,
            fragmentShader: planetFragmentShader,
            uniforms: this.uniforms
        })
    }
}
