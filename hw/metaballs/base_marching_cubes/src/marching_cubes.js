const THREE = require('three');

import Metaball from './metaball.js';
import LUT from './marching_cube_LUT.js';

export default class MarchingCubes {

  constructor(app) {      
    this.init(app);
  }

  init(app) {
    this.isPaused = false;    
    this.origin = new THREE.Vector3(0);

    this.isolevel = app.config.isolevel;
    this.minRadius = app.config.minRadius;
    this.maxRadius = app.config.maxRadius;

    this.gridCellWidth = app.config.gridCellWidth;
    this.halfCellWidth = app.config.gridCellWidth / 2.0;
    this.gridWidth = app.config.gridWidth;

    this.res = app.config.gridRes;
    this.res2 = app.config.gridRes * app.config.gridRes;
    this.res3 = app.config.gridRes * app.config.gridRes * app.config.gridRes;

    this.maxSpeed = app.config.maxSpeed;
    this.numMetaballs = app.config.numMetaballs;

    this.camera = app.camera;
    this.scene = app.scene;

    this.cells = [];
    this.labels = [];
    this.balls = [];

    this.showSpheres = true;
    this.showGrid = true;

    if (app.config.material) {
      this.material = new THREE.MeshPhongMaterial({ color: 0xff6a1d});
    } else {
      this.material = app.config.material;
    }

    this.setupCells();
    this.setupMetaballs();
    this.makeMesh();
    console.log("Grid init");
  };

  // Convert from 1D index to 3D indices
  i1toi3(i1) {

    // [i % w, i % (h * w)) / w, i / (h * w)]

    // @note: ~~ is a fast substitute for Math.floor()
    return [
      i1 % this.res,
      ~~ ((i1 % this.res2) / this.res),
      ~~ (i1 / this.res2)
      ];
  };

  // Convert from 3D indices to 1 1D
  i3toi1(i3x, i3y, i3z) {

    // [x + y * w + z * w * h]

    return i3x + i3y * this.res + i3z * this.res2;
  };

  // Convert from 3D indices to 3D positions
  i3toPos(i3) {

    return new THREE.Vector3(
      i3[0] * this.gridCellWidth + this.origin.x + this.halfCellWidth,
      i3[1] * this.gridCellWidth + this.origin.y + this.halfCellWidth,
      i3[2] * this.gridCellWidth + this.origin.z + this.halfCellWidth
      );
  };

  setupCells() {
    this.cells = [];
    for (var i = 0; i < this.res3; i++) {
      var i3 = this.i1toi3(i);
      var {x, y, z} = this.i3toPos(i3);
      var cell = new Cell(new THREE.Vector3(x, y, z), this.gridCellWidth);

      this.scene.add(cell.wireframe);
      this.scene.add(cell.mesh);
      this.scene.add(cell.center.mesh);
      
      this.cells.push(cell);
    }    
  }

  setupMetaballs() {

    this.balls = [];

    var x, y, z, vx, vy, vz, radius, pos, vel;
    var matLambertWhite = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    var maxRadiusTRippled = this.maxRadius * 3;
    var maxRadiusDoubled = this.maxRadius * 2;

    for (var i = 0; i < this.numMetaballs; i++) {
      x = Math.random() * (this.gridWidth - maxRadiusTRippled) + maxRadiusDoubled;
      y = Math.random() * (this.gridWidth - maxRadiusTRippled) + maxRadiusDoubled;
      z = Math.random() * (this.gridWidth - maxRadiusTRippled) + maxRadiusDoubled;  
      x = this.gridWidth / 2;    
      y = this.gridWidth / 2;    
      z = this.gridWidth / 2;    
      pos = new THREE.Vector3(x, y, z);
      
      vx = (Math.random() * 2 - 1) * this.maxSpeed;
      vy = (Math.random() * 2 - 1) * this.maxSpeed;
      vz = (Math.random() * 2 - 1) * this.maxSpeed;
      vel = new THREE.Vector3(vx, vy, vz);
      
      radius = Math.random() * (this.maxRadius - this.minRadius) + this.minRadius;
  
      var ball = new Metaball(pos, radius, vel, this.gridWidth);
      
      this.scene.add(ball.mesh);
      this.balls.push(ball);
    }
  }

  sample(point) {

    var isovalue = 0;
      // Accumulate f for each metaball relative to this cell
    for (var b = 0; b < this.balls.length; b++) {
      isovalue += (this.balls[b].radius2 / point.distanceToSquared(this.balls[b].pos));

    }
    return isovalue;
  }

  update() {

    if (this.isPaused) {
      return;
    }

    this.balls.forEach(function(ball) {
      ball.update();
    });

    for (var c = 0; c < this.res3; c++) {
      this.cells[c].hide();
    }

    // === SAMPLING FROM CENTERS
    for (var c = 0; c < this.res3; c++) {
      this.cells[c].center.isovalue = this.sample(this.cells[c].center.pos);

      // Color cells that have a sample > 1 at the center
      if (this.cells[c].center.isovalue > this.isolevel) {
        this.cells[c].mesh.visible = true;
      }

      // Update label
      if (this.showGrid) {
        this.cells[c].center.updateLabel(this.camera);
      } else {
        this.cells[c].center.clearLabel();
      }
    }

    this.updateMesh();
  }

  pause() {
    this.isPaused = true;
  }

  play() {
    this.isPaused = false;
  }

  show() {
    for (var i = 0; i < this.res3; i++) {
      this.cells[i].wireframe.visible = true;
    }
    this.showGrid = true;
  };

  hide() {
    for (var i = 0; i < this.res3; i++) {
      this.cells[i].wireframe.visible = false;
    }
    this.showGrid = false;
  };

  makeMesh() {
    // TODO
  }

  updateMesh() {
    // TODO

  }  
};

// === Inspect points
class Inspectpoint {

  constructor(pos, isovalue, color, visible) {
    this.pos = pos;
    this.isovalue = isovalue;
    this.color = color;
    this.visible = visible;
    this.mesh = null;
    this.label = null;

    this.init();
  }

  init() {
    this.makeMesh();
    this.makeLabel();
  };

  makeMesh() {
    var geo, mat;
    geo = new THREE.Geometry();
    geo.vertices.push(this.pos);
    mat = new THREE.PointsMaterial( { color: this.color, size: 5, sizeAttenuation: false } );
    this.mesh = new THREE.Points( geo, mat );
    this.mesh.visible = this.visible;    
  }

  makeLabel() {
    this.label = document.createElement('div');
    this.label.style.position = 'absolute';
    this.label.style.width = 100;
    this.label.style.height = 100;
    this.label.style.userSelect = 'none';
    this.label.style.cursor = 'default';
    this.label.style.fontSize = '0.3em';
    this.label.style.pointerEvents = 'none';
    document.body.appendChild(this.label);    
  }

  show() {
    this.mesh.visible = true;
  }

  hide() {
    this.mesh.visible = false;
    this.clearLabel();
  }

  updatePosition(newPos) {
    if (this.mesh) {
      this.mesh.position.set(newPos.x, newPos.y, newPos.z);
      this.show();
    }
  }

  updateLabel(camera) {

    var screenPos = this.pos.clone().project(camera);
    screenPos.x = ( screenPos.x + 1 ) / 2 * window.innerWidth;;
    screenPos.y = - ( screenPos.y - 1 ) / 2 *  window.innerHeight;;

    this.label.style.top = screenPos.y + 'px';
    this.label.style.left = screenPos.x + 'px';
    this.label.innerHTML = this.isovalue.toFixed(2);
    this.label.style.opacity = this.isovalue - 0.5;
  }

  clearLabel() {
    this.label.innerHTML = '';
    this.label.style.opacity = 0;
  }

}

// === LOOK
class Cell {

  constructor(position, gridCellWidth) {
    this.init(position, gridCellWidth);
  }

  init(position, gridCellWidth) {
    this.pos = position;
    this.gridCellWidth = gridCellWidth;

    this.wireframeMat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 10 } );
    this.lambertGreenMat = new THREE.MeshBasicMaterial( { color: 0x00ee00, transparent: true, opacity: 0.5 });
    
    this.makeMesh();
    this.makeInspectPoints();
  }

  makeMesh() {
    var halfGridCellWidth = this.gridCellWidth / 2.0;

    var positions = new Float32Array([
      // Front face
       halfGridCellWidth, halfGridCellWidth,  halfGridCellWidth,
       halfGridCellWidth, -halfGridCellWidth, halfGridCellWidth,
      -halfGridCellWidth, -halfGridCellWidth, halfGridCellWidth,
      -halfGridCellWidth, halfGridCellWidth,  halfGridCellWidth,

      // Back face
      -halfGridCellWidth,  halfGridCellWidth, -halfGridCellWidth,
      -halfGridCellWidth, -halfGridCellWidth, -halfGridCellWidth,
       halfGridCellWidth, -halfGridCellWidth, -halfGridCellWidth,
       halfGridCellWidth,  halfGridCellWidth, -halfGridCellWidth,
    ]);

    var indices = new Uint16Array([
      0, 1, 2, 3,
      4, 5, 6, 7,
      0, 7, 7, 4,
      4, 3, 3, 0,
      1, 6, 6, 5,
      5, 2, 2, 1
    ]);

    // Buffer geometry
    var geo = new THREE.BufferGeometry();
    geo.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    geo.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    // Wireframe line segments
    this.wireframe = new THREE.LineSegments( geo, this.wireframeMat );
    this.wireframe.position.set(this.pos.x, this.pos.y, this.pos.z);

    // Green cube
    geo = new THREE.BoxBufferGeometry(this.gridCellWidth, this.gridCellWidth, this.gridCellWidth);
    this.mesh = new THREE.Mesh( geo, this.lambertGreenMat );
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
  }

  makeInspectPoints() {
    var halfGridCellWidth = this.gridCellWidth / 2.0;
    var x = this.pos.x;
    var y = this.pos.y;
    var z = this.pos.z;
    var red = 0xff0000;

    // Center dot
    this.center = new Inspectpoint(new THREE.Vector3(x, y, z), 0, red, true); 
  }

  show() {
    this.mesh.visible = true;
    this.center.center.show();
  }

  hide() {
    this.mesh.visible = false;
    this.center.hide();
  }

  vertexInterpolation(isolevel, posA, posB) {

    // TODO
    var lerpPos;
    return lerpPos;
  }

  polygonize(isolevel) {

    // TODO
    var vertexList = [];
    var normalList = [];

    return {
      vertPositions: vertPositions,
      vertNormals: vertNormals
    };
  };
}