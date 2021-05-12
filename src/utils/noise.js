import * as THREE from 'three'

function pseudoRandom(seed) {
    return Math.abs((Math.sin(seed.x * 1461 + seed.y * 9744 + seed.z * 4744) * 10000) % 1)
}

function lerp(inputA, inputB, bias) {
    return (1 - bias) * inputA + bias * inputB
}

export default function perlinNoise3D(position) {
    const frequency = 0.1

    const uvw = new THREE.Vector3()
    uvw.x = Math.abs(position.x % frequency)
    uvw.y = Math.abs(position.y % frequency)
    uvw.z = Math.abs(position.z % frequency)

    const cell0 = new THREE.Vector3()
    cell0.x = Math.floor(position.x / frequency)
    cell0.y = Math.floor(position.y / frequency)
    cell0.z = Math.floor(position.z / frequency)
    const random0 = pseudoRandom(cell0)

    const cell1 = new THREE.Vector3()
    cell1.copy(cell0)
    cell1.x += frequency
    const random1 = pseudoRandom(cell1)

    const cell2 = new THREE.Vector3()
    cell2.copy(cell0)
    cell2.x += frequency
    cell2.z += frequency
    const random2 = pseudoRandom(cell2)

    const cell3 = new THREE.Vector3()
    cell3.copy(cell0)
    cell3.z += frequency
    const random3 = pseudoRandom(cell3)

    const cell4 = new THREE.Vector3()
    cell4.copy(cell0)
    cell4.y += frequency
    const random4 = pseudoRandom(cell4)

    const cell5 = new THREE.Vector3()
    cell5.copy(cell0)
    cell5.y += frequency
    cell5.x += frequency
    const random5 = pseudoRandom(cell5)

    const cell6 = new THREE.Vector3()
    cell6.copy(cell0)
    cell6.y += frequency
    cell6.x += frequency
    cell6.z += frequency
    const random6 = pseudoRandom(cell6)

    const cell7 = new THREE.Vector3()
    cell7.copy(cell0)
    cell7.y += frequency
    cell7.z += frequency
    const random7 = pseudoRandom(cell7)

    const bottomA = lerp(random0, random1, uvw.x)
    const bottomB = lerp(random3, random2, uvw.x)
    const bottom = lerp(bottomA, bottomB, uvw.z)

    const upperA = lerp(random4, random5, uvw.x)
    const upperB = lerp(random7, random6, uvw.x)
    const upper = lerp(upperA, upperB, uvw.z)

    return lerp(bottom, upper, uvw.y)
}
