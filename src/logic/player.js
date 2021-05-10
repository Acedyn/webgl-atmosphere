import * as THREE from 'three'

export default class Player extends THREE.PerspectiveCamera {
    constructor(fov, aspect) {
        super(fov, aspect)

        this.velocity = new THREE.Vector3(0, 0, 0)
        this.minVel = new THREE.Vector3(-2, -2, -2)
        this.maxVel = new THREE.Vector3(2, 2, 2)
        this.friction = 0.92

        window.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowDown":
                    this.velocity.z += 0.5
                    break
                case "ArrowUp":
                    this.velocity.z -= 0.5
                    break
                case "ArrowRight":
                    this.velocity.x += 0.5
                    break
                case "ArrowLeft":
                    this.velocity.x -= 0.5
                    break
            }
        })

        this.update = (dt) => {
            this.velocity.clamp(this.minVel, this.maxVel)
            this.translateX(this.velocity.x * dt)
            this.translateZ(this.velocity.z * dt)

            this.velocity.x *= this.friction
            this.velocity.z *= this.friction
        }
    }
}
