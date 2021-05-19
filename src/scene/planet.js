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

                const amplitude = perlinNoise3D(position)
                amplitude.multiplyScalar(0.2)

                const normalX = this.geometry.attributes.normal.array[i]
                this.geometry.attributes.position.array[i] += normalX * amplitude.x
                const normalY = this.geometry.attributes.normal.array[i + 1]
                this.geometry.attributes.position.array[i + 1] += normalY * amplitude.x
                const normalZ = this.geometry.attributes.normal.array[i + 2]
                this.geometry.attributes.position.array[i + 2] += normalZ * amplitude.x
            }
        }

        this.geometry = new THREE.SphereBufferGeometry(size, 100, 100)
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
