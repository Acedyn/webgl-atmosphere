import * as THREE from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {AtmospherePass} from '../shader/atomsphere';
import PlanetarySystem from "../scene/PlanetarySystem"
import Player from "./player"


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
        this.camera = new Player(50, this.sizes.width / this.sizes.height)
        this.camera.position.z = 20
        this.camera.position.y = 8
        this.camera.rotateX(-Math.PI * 0.15)
        this.scene.add(this.camera)

        // Renderer
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas})
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))
        this.composer.addPass(new AtmospherePass(this.scene, this.camera, this.planetarySystem))

        window.addEventListener("resize", () => {
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight
            this.camera.aspect = this.sizes.width / this.sizes.height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(this.sizes.width, this.sizes.height)
        })

        ////////////////////////////////////////
        // Methods
        ////////////////////////////////////////

        this.computeDeltaTime = () => {
            if (typeof this.dt === "undefined") {
                this.dt = 0;
                this.time = Date.now();
            } else {
                this.dt = Date.now() - this.time
                this.time = Date.now();
            }
        }

        this.processInput = () => {

        }

        this.update = () => {
            this.camera.update(this.dt * 0.001)
            //this.planetarySystem.update(this.dt * 0.001)
        }

        this.draw = () => {
            this.composer.render(this.scene, this.camera)
        }

        this.loop = () => {
            this.computeDeltaTime()
            this.processInput()
            this.update()
            this.draw()
            window.requestAnimationFrame(this.loop)
        }
    }
}
