
const THREE = require('three')
import {vec2} from 'gl-matrix'

var cylinder = new THREE.CylinderGeometry(1, 1, 2)
var lambertGreen = new THREE.MeshLambertMaterial({ color: 0x00ee00 })

export default class Agent {
  constructor() {
    this.mesh = new THREE.Mesh(cylinder, lambertGreen)
    this.mesh.position.y = 1

    this.position = vec2.fromValues(0, 0)
    this.velocity = vec2.fromValues(Math.random() - 0.5, Math.random() - 0.5)

    this.updateMesh()
  }

  updateMesh() {
    this.mesh.position.x = this.position[0]
    this.mesh.position.z = this.position[1]
  }
}