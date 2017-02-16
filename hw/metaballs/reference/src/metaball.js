const THREE = require('three')

export default class Metaball {
  constructor(pos, radius, vel, gridWidth) {
    this.gridWidth = gridWidth;
    this.pos = pos;
    this.radius = radius;
    this.radius2 = radius * radius;
    this.vel = vel;

    this.init();
  }

  init() {
    this.makeMesh();
  }

  makeMesh() {
    var geo = new THREE.SphereBufferGeometry(this.radius, 32, 32);
    var white = new THREE.MeshLambertMaterial( { color: 0x9EB3D8, transparent: true, opacity: 0.5 });
    this.mesh = new THREE.Mesh(geo, white);
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
  }

  show() {
    this.mesh.visible = true;
  };

  hide() {
    this.mesh.visible = false;
  };

  update() {

    var temp = this.pos.add(this.vel);
    var margin = this.radius;
    if ((temp.x - this.radius2 - margin) < 0 || (temp.x + this.radius2 + margin) > this.gridWidth) {
      this.vel.x *= -1;
    }
    if ((temp.y - this.radius2 - margin) < 0 || (temp.y + this.radius2 + margin) > this.gridWidth) {
      this.vel.y *= -1;
    }
    if ((temp.z - this.radius2 - margin) < 0 || (temp.z + this.radius2 + margin) > this.gridWidth) {
      this.vel.z *= -1;
    }
    this.pos = this.pos.add(this.vel);
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
  }
}