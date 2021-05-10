import * as THREE from 'three'
import PlanetarySystem from "../scene/PlanetarySystem"


export default class Game {
    constructor() {
        ////////////////////////////////////////
        // Properties
        ////////////////////////////////////////

        // Sizes
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // Canvas
        this.canvas = document.querySelector('canvas.webgl')

        // Scene
        this.scene = new THREE.Scene()

        // Planetary System
        this.planetarySystem = new PlanetarySystem()
        this.scene.add(this.planetarySystem)

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height)
        this.camera.position.z = 3
        this.scene.add(this.camera)

        // Renderer
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas})
        this.renderer.setSize(this.sizes.width, this.sizes.height)

        window.addEventListener("resize", () => {
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight
            this.camera.aspect = this.sizes.width / this.sizes.height
            this.renderer.setSize(this.sizes.width, this.sizes.height)
        })

        ////////////////////////////////////////
        // Methods
        ////////////////////////////////////////

        this.processInput = () => {

        }

        this.update = () => {

        }

        this.draw = () => {
            this.renderer.render(this.scene, this.camera)
        }

        this.loop = () => {
            this.processInput()
            this.update()
            this.draw()
            window.requestAnimationFrame(this.loop)
        }
    }
}
