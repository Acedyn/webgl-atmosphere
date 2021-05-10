import * as THREE from 'three'
import sunVertexShader from '../shader/sun.vert'
import sunFragmentShader from '../shader/sun.frag'
import worleyNoise from '../utils/noise'

export default class Planet extends THREE.Mesh {
    constructor(size) {
        super()

        this.generateHeight = () => {
            for (let i = 0; i < this.geometry.attributes.position.count * 3; i += 3) {
                const position = new THREE.Vector3(0, 0, 0)
                position.x = this.geometry.attributes.position.array[i]
                position.y = this.geometry.attributes.position.array[i + 1]
                position.z = this.geometry.attributes.position.array[i + 2]

                const amplitude = worleyNoise(position)

                const normalX = this.geometry.attributes.normal.array[i]
                this.geometry.attributes.position.array[i] += normalX * amplitude * 0.2
                const normalY = this.geometry.attributes.normal.array[i + 1]
                this.geometry.attributes.position.array[i + 1] += normalY * amplitude * 0.2
                const normalZ = this.geometry.attributes.normal.array[i + 2]
                this.geometry.attributes.position.array[i + 2] += normalZ * amplitude * 0.2
            }
        }


        this.geometry = new THREE.SphereBufferGeometry(size, 50, 50)
        this.generateHeight()
        this.material = new THREE.RawShaderMaterial({
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader
        })


    }
}
