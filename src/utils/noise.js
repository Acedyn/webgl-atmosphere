import * as THREE from 'three'

function pseudoRandom(seed) {
    return Math.abs((Math.sin(seed.x * 1461 + seed.y * 9744 + seed.z * 4744) * 10000) % 1)
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function lerp(inputA, inputB, bias) {
    return (1 - bias) * inputA + bias * inputB
}

export default function perlinNoise3D(position, frequency = 4, octave = 3) {

    let value = 0.0

    for (let i = 0; i < octave; i++) {

        frequency *= i + 1
        const uvw = new THREE.Vector3()
        uvw.x = mod(position.x * frequency, 1)
        uvw.y = mod(position.y * frequency, 1)
        uvw.z = mod(position.z * frequency, 1)

        const cell0 = new THREE.Vector3()
        cell0.x = Math.floor(position.x * frequency)
        cell0.y = Math.floor(position.y * frequency)
        cell0.z = Math.floor(position.z * frequency)
        const random0 = pseudoRandom(cell0)

        const cell1 = new THREE.Vector3()
        cell1.copy(cell0)
        cell1.x += 1
        const random1 = pseudoRandom(cell1)

        const cell2 = new THREE.Vector3()
        cell2.copy(cell0)
        cell2.x += 1
        cell2.z += 1
        const random2 = pseudoRandom(cell2)

        const cell3 = new THREE.Vector3()
        cell3.copy(cell0)
        cell3.z += 1
        const random3 = pseudoRandom(cell3)

        const cell4 = new THREE.Vector3()
        cell4.copy(cell0)
        cell4.y += 1
        const random4 = pseudoRandom(cell4)

        const cell5 = new THREE.Vector3()
        cell5.copy(cell0)
        cell5.y += 1
        cell5.x += 1
        const random5 = pseudoRandom(cell5)

        const cell6 = new THREE.Vector3()
        cell6.copy(cell0)
        cell6.y += 1
        cell6.x += 1
        cell6.z += 1
        const random6 = pseudoRandom(cell6)

        const cell7 = new THREE.Vector3()
        cell7.copy(cell0)
        cell7.y += 1
        cell7.z += 1
        const random7 = pseudoRandom(cell7)

        const bottomA = lerp(random0, random1, uvw.x)
        const bottomB = lerp(random3, random2, uvw.x)
        const bottom = lerp(bottomA, bottomB, uvw.z)

        const upperA = lerp(random4, random5, uvw.x)
        const upperB = lerp(random7, random6, uvw.x)
        const upper = lerp(upperA, upperB, uvw.z)

        if (i == 0) {
            value += lerp(bottom, upper, uvw.y) * 0.7
        }
        else {
            value += lerp(bottom, upper, uvw.y) * Math.pow(0.5, i)
        }
    }

    return new THREE.Vector3(value, value, value)
}
