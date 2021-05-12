import * as THREE from 'three'
import perlinNoise3D from '../utils/noise'

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
                this.geometry.attributes.color.array[i] = amplitude
                this.geometry.attributes.color.array[i + 1] = amplitude
                this.geometry.attributes.color.array[i + 2] = amplitude

                const normalX = this.geometry.attributes.normal.array[i]
                this.geometry.attributes.position.array[i] += normalX * amplitude * 0
                const normalY = this.geometry.attributes.normal.array[i + 1]
                this.geometry.attributes.position.array[i + 1] += normalY * amplitude * 0
                const normalZ = this.geometry.attributes.normal.array[i + 2]
                this.geometry.attributes.position.array[i + 2] += normalZ * amplitude * 0
            }
        }


        this.geometry = new THREE.SphereBufferGeometry(size, 100, 100)
        const colors = new Float32Array(this.geometry.attributes.position.count * 3)
        this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
        this.generateHeight()
        this.material = new THREE.MeshStandardMaterial()
        this.material.vertexColors = true
    }
}
