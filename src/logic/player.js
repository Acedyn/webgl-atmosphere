import * as THREE from 'three'

export default class Player extends THREE.PerspectiveCamera {
    constructor(fov, aspect) {
        super(fov, aspect)

        this.force = new THREE.Vector3(0, 0, 0)
        this.velocity = new THREE.Vector3(0, 0, 0)
        this.minVel = new THREE.Vector3(-4, -4, -4)
        this.maxVel = new THREE.Vector3(4, 4, 4)
        this.friction = 0.92

        this.rotationalDirection = new THREE.Vector3(0, 0, 0)
        this.rotationalSpeed = 0.0
        this.mouseStart = new THREE.Vector2(0, 0)
        this.mouseEnd = new THREE.Vector2(0, 0)
        this.rotationalFriction = 0.9


        window.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowDown":
                    this.force.z = 1
                    break
                case "ArrowUp":
                    this.force.z = -1
                    break
                case "ArrowRight":
                    this.force.x = 1
                    break
                case "ArrowLeft":
                    this.force.x = -1
                    break
            }
        })

        window.addEventListener("keyup", (e) => {
            const forwardKeys = ["ArrowDown", "ArrowUp"]
            const sideKeys = ["ArrowLeft", "ArrowRight"]
            if (forwardKeys.includes(e.key)) {
                this.force.z = 0
            }
            if (sideKeys.includes(e.key)) {
                this.force.x = 0
            }
        })

        window.addEventListener("mousedown", (e) => {
            this.isDraging = true
            this.mouseStart.set(e.x / window.innerWidth, e.y / window.innerHeight)
        })

        window.addEventListener("touchstart", (e) => {
            this.isDraging = true
            this.mouseStart.set(e.touches[0].clientX / window.innerWidth, e.touches[0].clientY / window.innerHeight)
        })

        window.addEventListener("mouseup", (e) => {
            this.isDraging = false
        })

        window.addEventListener("touchend", (e) => {
            this.isDraging = false
        })

        window.addEventListener("mousemove", (e) => {
            if (this.isDraging) {
                this.mouseEnd.set(e.x / window.innerWidth, e.y / window.innerHeight)
            }
        })

        window.addEventListener("touchmove", (e) => {
            if (this.isDraging) {
                this.mouseEnd.set(e.touches[0].clientX / window.innerWidth, e.touches[0].clientY / window.innerHeight)
            }
        })

        this.update = (dt) => {
            this.velocity.add(this.force)
            this.velocity.clamp(this.minVel, this.maxVel)
            this.translateX(this.velocity.x * dt)
            this.translateZ(this.velocity.z * dt)

            this.velocity.multiplyScalar(this.friction)

            if (this.isDraging) {
                const mouseVelocity = new THREE.Vector2()
                mouseVelocity.copy(this.mouseEnd)
                mouseVelocity.sub(this.mouseStart)

                this.rotationalDirection.x = mouseVelocity.y
                this.rotationalDirection.y = mouseVelocity.x
                this.rotationalSpeed = mouseVelocity.length()
                this.rotateOnAxis(this.rotationalDirection.normalize(), this.rotationalSpeed)
                this.mouseStart.copy(this.mouseEnd)
            } else {
                this.rotationalSpeed *= this.rotationalFriction
                this.rotateOnAxis(this.rotationalDirection.normalize(), this.rotationalSpeed)
            }
        }
    }
}
