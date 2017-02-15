const THREE = require('three');

import Metaball from './metaball.js';
import LUT from './marching_cube_LUT.js';
export default class Grid {

  constructor(app) {
    
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    THREE.ImmediateRenderObject.call( this, material );
    
    this.origin = new THREE.Vector3(0);

    this.isolevel = app.config.isolevel;
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
    this.isSamplingCorner = false;

    this.geometry = undefined;
    this.metaballMesh = undefined;

    // Convert from 1D index to 3D indices
    this.i1toi3 = function(i1) {

      // [i % w, i % (h * w)) / w, i / (h * w)]

      return [
        i1 % this.res,
        ~~ ((i1 % this.res2) / this.res), // @todo: add comment
        ~~ (i1 / this.res2)
        ];
    };

    // Convert from 3D indices to 1 1D
    this.i3toi1 = function(i3x, i3y, i3z) {

      // [x + y * w + z * w * h]

      return i3x + i3y * this.res + i3z * this.res2;
    };

    // Convert from 3D indices to 3D positions
    this.i3toPos = function(i3) {

      return new THREE.Vector3(
        i3[0] * this.gridCellWidth + this.origin.x + this.halfCellWidth,
        i3[1] * this.gridCellWidth + this.origin.y + this.halfCellWidth,
        i3[2] * this.gridCellWidth + this.origin.z + this.halfCellWidth
        );
    };

    this.init();    
  }

  init() {
    this.setupCells();
    this.setupMetaballs();
    console.log("Grid init");
  };

  setupCells() {
    for (var i = 0; i < this.res3; i++) {
      var i3 = this.i1toi3(i);
      var {x, y, z} = this.i3toPos(i3);
      var cell = new Cell(new THREE.Vector3(x, y, z), this.gridCellWidth);

      this.scene.add(cell.wireframe);
      this.scene.add(cell.mesh);
      this.scene.add(cell.center.mesh);
      
      for (var cp = 0; cp < 8; cp++) {
        this.scene.add(cell.corners[cp].mesh);
      }
      
      for (var e = 0; e < 12; e++) {
        this.scene.add(cell.edges[e].mesh);
      }

      this.cells.push(cell);
    }    
  }

  setupMetaballs() {
    var x, y, z, vx, vy, vz, radius, pos, vel;
    var matLambertWhite = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    var maxRadiusDoubled = this.maxRadius * 2;

    for (var i = 0; i < this.numMetaballs; i++) {
      x = Math.random() * (this.gridWidth - maxRadiusDoubled) + this.maxRadius;
      y = Math.random() * (this.gridWidth - maxRadiusDoubled) + this.maxRadius;
      z = Math.random() * (this.gridWidth - maxRadiusDoubled) + this.maxRadius;      
      pos = new THREE.Vector3(x, y, z);
      
      vx = (Math.random() * 2 - 1) * this.maxSpeed;
      vy = (Math.random() * 2 - 1) * this.maxSpeed;
      vz = (Math.random() * 2 - 1) * this.maxSpeed;
      vel = new THREE.Vector3(vx, vy, vz);
      
      radius = Math.random() * this.maxRadius + 0.5;
  
      var ball = new Metaball(pos, radius, vel, this.gridWidth);
      
      this.scene.add(ball.mesh);
      this.balls.push(ball);
    }
  }

  render(renderCallback) {

  }

  generateGeometry() {
    var geo = new THREE.Geometry();
  }

  update() {

    // Reset grid state
    for (var c = 0; c < this.res3; c++) {
      // Clear cells
      this.cells[c].hide();
    }

    if (this.isSamplingCorner === false) {

      // -- SAMPLE AT CENTER
      // Color cells that have a sample > 1 at the center
      for (var c = 0; c < this.res3; c++) {
        this.cells[c].center.isovalue = 0;
        for (var b = 0; b < this.balls.length; b++) {
          // Accumulate f for each metaball relative to this cell
          this.cells[c].center.isovalue += this.balls[b].radius2 / this.cells[c].center.pos.distanceToSquared(this.balls[b].pos);
          if (this.cells[c].center.isovalue > this.isolevel) {
            this.cells[c].mesh.visible = true;
          }
        }

        // Update label
        if (this.showGrid === false) {
          this.cells[c].center.clearLabel();
          continue;
        }

        this.cells[c].center.updateLabel(this.camera);
      }    

    } else {

      this.geometry = new THREE.Geometry();
      this.positionsArray = [];
      this.normalsArray = [];

      // -- SAMPLE AT CORNERS
      // Color cells that have a sample > 1 at the corners
      for (var c = 0; c < this.res3; c++) {
        for (var cp = 0; cp < 8; cp++) {
          this.cells[c].corners[cp].isovalue = 0;
          for (var b = 0; b < this.balls.length; b++) {

            // Accumulate f for each metaball relative to this cell
            this.cells[c].corners[cp].isovalue += this.balls[b].radius2 / this.cells[c].corners[cp].pos.distanceToSquared(this.balls[b].pos);

            if (this.cells[c].corners[cp].isovalue > this.isolevel) {
              this.cells[c].corners[cp].show();
            }
          }

          // Draw edges
          var polygon = this.cells[c].polygonize(this.isolevel);

          if (polygon !== null && polygon !== undefined) {
            this.positionsArray.push.apply(this.positionsArray, polygon.vertPositions);
            this.normalsArray.push.apply(this.normalsArray, polygon.vertNormals);
          }

          // Update label
          if (this.showGrid === false) {
            this.cells[c].corners[cp].clearLabel();
            continue;
          }

          this.cells[c].corners[cp].updateLabel(this.camera);
        }
      }

      if (this.metaballMesh !== undefined) {
        this.scene.remove(this.metaballMesh);
      }
      this.makeMesh();
    }

    // Move metaballs
    for (var i = 0; i < this.balls.length; i++) {
      this.balls[i].update();
    }

  }

  makeMesh() {
    if (this.positionsArray.length > 0) {
      var start = 0;
      for (var i = 0; i < this.positionsArray.length; i++) {
        this.geometry.vertices.push(this.positionsArray[i]);
      }

      for (var i = 0; i < this.positionsArray.length / 3; i++) {
        var a = (start + i) * 3;
        var b = a + 1;
        var c = a + 2;
        this.geometry.faces.push(new THREE.Face3(a, b, c, [this.normalsArray[a], this.normalsArray[b], this.normalsArray[c]]));
      }

      var material = new THREE.MeshBasicMaterial( { color: 0xee2222});
      this.metaballMesh = new THREE.Mesh(this.geometry, material);
      this.scene.add(this.metaballMesh);
    }     
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
    if (this.mesh !== null && this.mesh !== undefined) {
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

  constructor(pos, gridCellWidth) {
    this.pos = pos;
    this.gridCellWidth = gridCellWidth;
    this.init();
  }

  init() {
    this.makeMesh();
    this.makeInspectPoints();
  }

  makeMesh() {
    var halfGridCellWidth = this.gridCellWidth / 2.0;
    var red = 0xff0000;

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

    // Material
    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 10 } );

    // Wireframe line segments
    this.wireframe = new THREE.LineSegments( geo, mat );
    this.wireframe.position.set(this.pos.x, this.pos.y, this.pos.z);

    // Green cube
    geo = new THREE.BoxBufferGeometry(this.gridCellWidth, this.gridCellWidth, this.gridCellWidth);
    mat = new THREE.MeshBasicMaterial( { color: 0x00ee00, transparent: true, opacity: 0.5 });
    this.mesh = new THREE.Mesh( geo, mat );
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
  }

  makeInspectPoints() {
    var halfGridCellWidth = this.gridCellWidth / 2.0;
    var x = this.pos.x;
    var y = this.pos.y;
    var z = this.pos.z;
    var green = 0x00ff00;
    var red = 0xff0000;

    // Center dot
    this.center = new Inspectpoint(new THREE.Vector3(x, y, z), 0, 0x0, true);

    // Corners
    this.corners = [
      new Inspectpoint(new THREE.Vector3(-halfGridCellWidth + x, -halfGridCellWidth + y, -halfGridCellWidth + z), 0, green, false),
      new Inspectpoint(new THREE.Vector3(halfGridCellWidth + x, -halfGridCellWidth + y, -halfGridCellWidth + z), 0, green, false),
      new Inspectpoint(new THREE.Vector3(halfGridCellWidth + x, -halfGridCellWidth + y, halfGridCellWidth + z), 0, green, false),
      new Inspectpoint(new THREE.Vector3(-halfGridCellWidth + x, -halfGridCellWidth + y, halfGridCellWidth + z), 0, green, false),
      new Inspectpoint(new THREE.Vector3(-halfGridCellWidth + x, halfGridCellWidth + y, -halfGridCellWidth + z), 0, green, false),
      new Inspectpoint(new THREE.Vector3(halfGridCellWidth + x, halfGridCellWidth + y, -halfGridCellWidth + z), 0, green, false),
      new Inspectpoint(new THREE.Vector3(halfGridCellWidth + x, halfGridCellWidth + y, halfGridCellWidth + z), 0, green, false),
      new Inspectpoint(new THREE.Vector3(-halfGridCellWidth + x, halfGridCellWidth + y, halfGridCellWidth + z), 0, green, false)
    ];  
    
    // Edges
    this.edges = [];
    for (var e = 0; e < 12; ++e) {
      this.edges.push(new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false));
    }
  }

  show() {
    this.mesh.visible = true;
    this.center.center.show();
    for (var cp = 0; cp < 8; cp++) {
        this.corners[cp].show();
    }
  }

  hide() {
    this.mesh.visible = false;
    this.center.hide();
    for (var cp = 0; cp < 8; cp++) {
        this.corners[cp].hide();
    }
  }

  vertexInterpolation(isolevel, cornerA, cornerB) {
    if (Math.abs(isolevel - cornerA.isovalue) < 0.00001) {
      return cornerA.pos;
    } else if (Math.abs(isolevel - cornerB.isovalue) < 0.00001) {
      return cornerB.pos;
    } else if (Math.abs(cornerA.isovalue - cornerB.isovalue) < 0.00001) {
      return cornerA.pos;
    }

    var t = (isolevel - cornerA.isovalue) / (cornerB.isovalue - cornerA.isovalue);
    var pos = new THREE.Vector3(
      cornerA.pos.x + t * (cornerB.pos.x - cornerA.pos.x),
      cornerA.pos.y + t * (cornerB.pos.y - cornerA.pos.y),
      cornerA.pos.z + t * (cornerB.pos.z - cornerA.pos.z)
      );
    return pos;
  }

  polygonize(isolevel) {

    var vertexList = [];
    for (var v = 0; v < 12; v++) {
      vertexList.push(new THREE.Vector3(0, 0, 0));
    }
    var LUTIndex = 0;
    var corner, edges, alpha;

    // Check which edges are intersected based on isovalues at each corners
    for (corner = 0; corner < 8; corner++) {
      if (this.corners[corner].isovalue > isolevel) {
        LUTIndex = LUTIndex | (1 << corner);
      }
    }

    edges = LUT.EDGE_TABLE[LUTIndex];
    if (edges === 0) {
      return;
    }

    if (edges & 1) {
      vertexList[0] = this.vertexInterpolation(isolevel, this.corners[0], this.corners[1]);
    }
    if (edges & 2) {
      vertexList[1] = this.vertexInterpolation(isolevel, this.corners[1], this.corners[2]);
    }
    if (edges & 4) {
      vertexList[2] = this.vertexInterpolation(isolevel, this.corners[2], this.corners[3]);
    }
    if (edges & 8) {
      vertexList[3] = this.vertexInterpolation(isolevel, this.corners[3], this.corners[0]);
    }
    if (edges & 16) {
      vertexList[4] = this.vertexInterpolation(isolevel, this.corners[4], this.corners[5]);
    }
    if (edges & 32) {
      vertexList[5] = this.vertexInterpolation(isolevel, this.corners[5], this.corners[6]);
    }
    if (edges & 64) {
      vertexList[6] = this.vertexInterpolation(isolevel, this.corners[6], this.corners[7]);
    }
    if (edges & 128) {
      vertexList[7] = this.vertexInterpolation(isolevel, this.corners[7], this.corners[4]);
    }
    if (edges & 256) {
      vertexList[8] = this.vertexInterpolation(isolevel, this.corners[0], this.corners[4]);
    }
    if (edges & 512) {
      vertexList[9] = this.vertexInterpolation(isolevel, this.corners[1], this.corners[5]);
    }
    if (edges & 1024) {
      vertexList[10] = this.vertexInterpolation(isolevel, this.corners[2], this.corners[6]);
    }
    if (edges & 2048) {
      vertexList[11] = this.vertexInterpolation(isolevel, this.corners[3], this.corners[7]);
    }

    // Create triangles
    LUTIndex <<= 4; // re-purpose into offset to triangle table

    var o1, o2, o3, numTris = 0;

    var vertPositions = [];
    var vertNormals = []

    for (var i = 0; LUT.TRI_TABLE[LUTIndex + i] != -1; i+= 3) {

      o1 = LUTIndex + i;
      o2 = o1 + 1;
      o3 = o1 + 2;

      var v0 = vertexList[LUT.TRI_TABLE[LUTIndex + i]];
      var v1 = vertexList[LUT.TRI_TABLE[LUTIndex + i + 1]];
      var v2 = vertexList[LUT.TRI_TABLE[LUTIndex + i + 2]];

      vertPositions.push(v0);
      vertPositions.push(v1);
      vertPositions.push(v2);

      var tri = new THREE.Triangle(v0, v1, v2);
      var normal = tri.normal();
      vertNormals.push(normal.clone());
      vertNormals.push(normal.clone());
      vertNormals.push(normal.clone());

      numTris++;

    }

    return {
      vertPositions: vertPositions,
      vertNormals: vertNormals
    };
  };
}
