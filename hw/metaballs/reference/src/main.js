
// Credit:
// http://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/
// http://paulbourke.net/geometry/polygonise/

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Noise from './improved_noise.js'
import LUT from './marching_cube_LUT.js'

var SamplingPointEnum = {
CENTER: 0,
CORNERS: 1
};

// called after the scene loads
function onLoad(framework) {

  // LOOK: the line below is synyatic sugar for the code above. Optional, but I sort of recommend it.
  var {scene, camera, renderer, gui, stats} = framework;

  renderer.setClearColor( 0xbfd1e5 );

  setupCamera(camera);
  setupLights(scene);

  // ===== Construct grid ====== //

  var gridRes = 1;
  var gridWidth = 10;
  var config = {
    gridRes: gridRes,
    gridWidth: gridWidth,
    gridCellWidth: gridWidth / gridRes,
    numMetaballs: 1,
    maxRadius: 20,
    maxSpeed: 0.1
  };

  framework.grid = new Grid(config, framework);

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  // --- CONFIG ---
  var GUIControls = function() {
    this.restart = function() {
      window.location.reload();
    }
    this.speed = config.maxSpeed / 2.0;
    this.samplingCorners = true
  }
  var guiControls = new GUIControls();
  gui.add(guiControls, 'restart');
  gui.add(guiControls, 'speed', 0, config.maxSpeed).onChange(function(value) {

  });

  gui.add(guiControls, 'samplingCorners').onChange(function(value) {
    if (value) {
        framework.grid.samplingPoint = SamplingPointEnum.CORNERS;
    } else {
        framework.grid.samplingPoint = SamplingPointEnum.CENTER;
    }
  });

  // --- DEBUG ---
  var DebugOptions = function() {
    this.showGrid = false;
    this.showSpheres = false;
  };
  var debug = new DebugOptions();
  var debugFolder = gui.addFolder('Debug');
  debugFolder.add(debug, 'showGrid').onChange(function(value) {
    if (value) {
      framework.grid.show();
    } else {
      framework.grid.hide();
    }
  });
  debugFolder.add(debug, 'showSpheres').onChange(function(value) {
    if (value) {
      for (var i = 0; i < config.numMetaballs; i++) {
        framework.grid.balls[i].show();
      }
    } else {
      for (var i = 0; i < config.numMetaballs; i++) {
        framework.grid.balls[i].hide();
      }
    }
  });
  debugFolder.open();
}

// called on frame updates
function onUpdate(framework) {

  if (framework.grid !== undefined) {
    framework.grid.update(framework);
  }

  if (framework.camera !== undefined && framework.camera.hasMoved !== undefined) {
    if (framework.camera.hasMoved) {
      framework.camera.hasMoved = false;
    }
  }
}

// function setupShaders() {
  //var vertexShader = require("shader.vs");
  //var fragmentShader = require("shader.fs");
// }

function setupCamera(camera) {
  // set camera position
  camera.position.set(5, 5, 50);
  camera.lookAt(new THREE.Vector3(0,0,0));
}

function setupLights(scene) {

  // Directional light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 10, 2);
  directionalLight.position.multiplyScalar(10);

  scene.add(directionalLight);
}

// LOOK
var Grid = function(config, framework) {

  // LOOK
  var Cell = function(x, y, z) {

    var Inspectpoint = function(pos, isovalue, color, visible) {

      this.pos = pos;
      this.isovalue = isovalue;
      this.mesh = null;
      this.label = null;

      this.init = function() {
        var geo, mat;

        // Geometry
        geo = new THREE.Geometry();
        geo.vertices.push(pos);
        mat = new THREE.PointsMaterial( { color: color, size: 5, sizeAttenuation: false } );
        this.mesh = new THREE.Points( geo, mat );
        this.mesh.visible = visible;

        // Label
        this.label = document.createElement('div');
        this.label.style.position = 'absolute';
        this.label.style.width = 100;
        this.label.style.height = 100;
        this.label.style.userSelect = 'none';
        this.label.style.cursor = 'default';
        this.label.style.fontSize = '0.3em';
        this.label.style.pointerEvents = 'none';
        document.body.appendChild(this.label);

      };

      this.show = function() {
        this.mesh.visible = true;
      }

      this.hide = function() {
        this.mesh.visible = false;
        this.clearLabel();
      }

      this.updatePosition = function(newPos) {
        if (this.mesh !== null && this.mesh !== undefined) {
          this.mesh.position.set(newPos.x, newPos.y, newPos.z);
          this.show();
        }
      }

      this.updateLabel = function(camera) {

        var screenPos = this.pos.clone().project(camera);
        screenPos.x = ( screenPos.x + 1 ) / 2 * window.innerWidth;;
        screenPos.y = - ( screenPos.y - 1 ) / 2 *  window.innerHeight;;

        this.label.style.top = screenPos.y + 'px';
        this.label.style.left = screenPos.x + 'px';
        this.label.innerHTML = this.isovalue.toFixed(2);
        this.label.style.opacity = this.isovalue - 0.5;
      }

      this.clearLabel = function() {
        this.label.innerHTML = '';
        this.label.style.opacity = 0;
      }

      this.init();
    }

    this.init = function() {
      var halfGridCellWidth = config.gridCellWidth / 2.0;

      var green = 0x00ff00;
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
      this.wireframe.position.set(x, y, z);

      // Green cube
      geo = new THREE.BoxBufferGeometry(config.gridCellWidth, config.gridCellWidth, config.gridCellWidth);
      mat = new THREE.MeshBasicMaterial( { color: 0x00ee00, transparent: true, opacity: 0.5 });
      this.mesh = new THREE.Mesh( geo, mat );
      this.mesh.position.set(x, y, z);
      this.mesh.visible = false;

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
      this.edges = [
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
        new Inspectpoint(new THREE.Vector3(0, 0, 0), 0, red, false),
      ];

    }

    this.show = function() {
      this.mesh.visible = true;
      this.center.center.show();
      for (var cp = 0; cp < 8; cp++) {
          this.corners[cp].show();
      }
    }

    this.hide = function() {
      this.mesh.visible = false;
      this.center.hide();
      for (var cp = 0; cp < 8; cp++) {
          this.corners[cp].hide();
      }
    }

    this.polygonize = function(isolevel) {

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

      if ((edges & 1) > 0) {
        this.edges[0].isovalue = (isolevel - this.corners[0].isovalue) / (this.corners[1].isovalue - this.corners[0].isovalue);
        this.edges[0].updatePosition(this.corners[0].pos.clone().lerp(this.corners[1].pos, this.edges[0].isovalue));
      }
      if ((edges & 2) > 0) {
        this.edges[1].isovalue = (isolevel - this.corners[1].isovalue) / (this.corners[2].isovalue - this.corners[1].isovalue);
        this.edges[1].updatePosition(this.corners[1].pos.clone().lerp(this.corners[2].pos, this.edges[1].isovalue));
      }
      if ((edges & 4) > 0) {
        this.edges[2].isovalue = (isolevel - this.corners[2].isovalue) / (this.corners[3].isovalue - this.corners[2].isovalue);
        this.edges[2].updatePosition(this.corners[2].pos.clone().lerp(this.corners[3].pos, this.edges[2].isovalue));
      }
      if ((edges & 8) > 0) {
        this.edges[3].isovalue = (isolevel - this.corners[3].isovalue) / (this.corners[0].isovalue - this.corners[3].isovalue);
        this.edges[3].updatePosition(this.corners[3].pos.clone().lerp(this.corners[0].pos, this.edges[3].isovalue));
      }
      if ((edges & 16) > 0) {
        this.edges[4].isovalue = (isolevel - this.corners[4].isovalue) / (this.corners[5].isovalue - this.corners[4].isovalue);
        this.edges[4].updatePosition(this.corners[4].pos.clone().lerp(this.corners[5].pos, this.edges[4].isovalue));
      }
      if ((edges & 32) > 0) {
        this.edges[5].isovalue = (isolevel - this.corners[5].isovalue) / (this.corners[6].isovalue - this.corners[5].isovalue);
        this.edges[5].updatePosition(this.corners[5].pos.clone().lerp(this.corners[6].pos, this.edges[5].isovalue));
      }
      if ((edges & 64) > 0) {
        this.edges[6].isovalue = (isolevel - this.corners[6].isovalue) / (this.corners[7].isovalue - this.corners[7].isovalue);
        this.edges[6].updatePosition(this.corners[6].pos.clone().lerp(this.corners[7].pos, this.edges[6].isovalue));
      }
      if ((edges & 128) > 0) {
        this.edges[7].isovalue = (isolevel - this.corners[7].isovalue) / (this.corners[4].isovalue - this.corners[7].isovalue);
        this.edges[7].updatePosition(this.corners[7].pos.clone().lerp(this.corners[4].pos, this.edges[7].isovalue));
      }
      if ((edges & 256) > 0) {
        this.edges[9].isovalue = (isolevel - this.corners[4].isovalue) / (this.corners[0].isovalue - this.corners[4].isovalue);
        this.edges[8].updatePosition(this.corners[4].pos.clone().lerp(this.corners[0].pos, this.edges[8].isovalue));
      }
      if ((edges & 512) > 0) {
        this.edges[9].isovalue = (isolevel - this.corners[5].isovalue) / (this.corners[1].isovalue - this.corners[5].isovalue);
        this.edges[9].updatePosition(this.corners[5].pos.clone().lerp(this.corners[1].pos, this.edges[9].isovalue));
      }
      if ((edges & 1024) > 0) {
        this.edges[10].isovalue = (isolevel - this.corners[6].isovalue) / (this.corners[2].isovalue - this.corners[6].isovalue);
        this.edges[10].updatePosition(this.corners[6].pos.clone().lerp(this.corners[2].pos, this.edges[10].isovalue));
      }
      if ((edges & 2048) > 0) {
        this.edges[11].isovalue = (isolevel - this.corners[7].isovalue) / (this.corners[3].isovalue - this.corners[7].isovalue);
        this.edges[11].updatePosition(this.corners[7].pos.clone().lerp(this.corners[3].pos, this.edges[11].isovalue));
      }
    }

    this.init();
  }

  this.maxRadius = config.maxRadius;
  this.origin = new THREE.Vector3(0);
  this.cellWidth = config.gridCellWidth;
  this.halfCellWidth = config.gridCellWidth / 2.0;
  this.gridWidth = config.gridWidth;
  this.res = config.gridRes;
  this.res2 = config.gridRes * config.gridRes;
  this.res3 = config.gridRes * config.gridRes * config.gridRes;
  this.maxSpeed = config.maxSpeed;
  this.numMetaballs = config.numMetaballs;
  this.cells = [];
  this.labels = [];
  this.camera = framework.camera;
  this.visible = true;
  this.samplingPoint = SamplingPointEnum.CORNERS;
  this.balls = [];

  this.init = function() {

    for (var i = 0; i < this.res3; i++) {
      var i3 = this.i1toi3(i);
      var pos = this.i3toPos(i3);
      var {x, y, z} = pos;
      var cell = new Cell(x, y, z);

      framework.scene.add(cell.wireframe);
      framework.scene.add(cell.mesh);
      framework.scene.add(cell.center.mesh);
      for (var cp = 0; cp < 8; cp++) {
        framework.scene.add(cell.corners[cp].mesh);
      }
      for (var e = 0; e < 12; e++) {
        framework.scene.add(cell.edges[e].mesh);
      }

      this.cells.push(cell);
    }

    // ===== Setup metaballs ====== //
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
      framework.scene.add(ball.mesh);
      this.balls.push(ball);
    }

    this.hide();

    console.log("Grid init");
  };

  this.update = function(framework) {

    // Reset grid state
    for (var c = 0; c < this.res3; c++) {
      // Clear cells
      this.cells[c].hide();
    }

    if (this.samplingPoint === SamplingPointEnum.CENTER) {

      // -- SAMPLE AT CENTER
      // Color cells that have a sample > 1 at the center
      for (var c = 0; c < this.res3; c++) {
        this.cells[c].center.isovalue = 0;
        for (var b = 0; b < this.balls.length; b++) {
          // Accumulate f for each metaball relative to this cell
          this.cells[c].center.isovalue += this.balls[b].radius2 / this.cells[c].center.pos.distanceToSquared(this.balls[b].pos);
          if (this.cells[c].center.isovalue > 1) {
            this.cells[c].mesh.visible = true;
            this.cells[c].center.show();
          }
        }

        // Update label
        if (this.visible === false) {
          this.cells[c].center.clearLabel();
          continue;
        }

        this.cells[c].center.updateLabel(this.camera);
      }
    } else if (this.samplingPoint === SamplingPointEnum.CORNERS) {

      // -- SAMPLE AT CORNERS
      // Color cells that have a sample > 1 at the corners
      for (var c = 0; c < this.res3; c++) {
        for (var cp = 0; cp < 8; cp++) {
          this.cells[c].corners[cp].isovalue = 0;
          for (var b = 0; b < this.balls.length; b++) {
            // Accumulate f for each metaball relative to this cell
            this.cells[c].corners[cp].isovalue += this.balls[b].radius2 / this.cells[c].corners[cp].pos.distanceToSquared(this.balls[b].pos);
            if (cp === 3) {
              this.cells[c].corners[3].isovalue = 1;
            } else {
              this.cells[c].corners[cp].isovalue = 0;
            }
            if (this.cells[c].corners[cp].isovalue > 1) {
              this.cells[c].corners[cp].show();
            }
          }


          // Draw edges
          this.cells[c].polygonize(1);

          // Update label
          if (this.visible === false) {
            this.cells[c].corners[cp].clearLabel();
            continue;
          }

          this.cells[c].corners[cp].updateLabel(this.camera);
        }
      }
    }

    // Move metaballs
    for (var i = 0; i < this.balls.length; i++) {
      this.balls[i].update();
    }

  }

  this.show = function() {
    for (var i = 0; i < this.res3; i++) {
      this.cells[i].wireframe.visible = true;
    }
    this.visible = true;
  };

  this.hide = function() {
    for (var i = 0; i < this.res3; i++) {
      this.cells[i].wireframe.visible = false;
    }
    this.visible = false;
  };

  // Convert from 1D index to 3D indices
  this.i1toi3 = function(i1) {

    // [i % w, i % (h * w)) / w, i / (h * w)]

    return [
      i1 % this.res,
      ~~ ((i1 % this.res2) / this.res),
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
      i3[0] * this.cellWidth + this.origin.x + this.halfCellWidth,
      i3[1] * this.cellWidth + this.origin.y + this.halfCellWidth,
      i3[2] * this.cellWidth + this.origin.z + this.halfCellWidth
      );
  };

  this.init();
};

var Metaball = function(pos, radius, vel, gridWidth) {
  this.gridWidth = gridWidth;
  this.pos = pos;
  this.radius = radius;
  this.radius2 = radius * radius;
  this.vel = vel;

  this.init = function() {
    var geo = new THREE.SphereBufferGeometry(radius, 32, 32);
    var white = new THREE.MeshLambertMaterial( { color: 0x9EB3D8, transparent: true, opacity: 0.5 });
    this.mesh = new THREE.Mesh(geo, white);
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);

    this.hide();
  }

  this.show = function() {
    this.mesh.visible = true;
  };

  this.hide = function() {
    this.mesh.visible = false;
  };

  this.update = function() {

    var temp = this.pos.add(this.vel);
    if ((temp.x - this.radius) < 0 || (temp.x + this.radius) > this.gridWidth) {
      this.vel.x *= -1;
    }
    if ((temp.y - this.radius) < 0 || (temp.y + this.radius) > this.gridWidth) {
      this.vel.y *= -1;
    }
    if ((temp.z - this.radius) < 0 || (temp.z + this.radius) > this.gridWidth) {
      this.vel.z *= -1;
    }
    this.pos = this.pos.add(this.vel);
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
  }

  this.init();
}

function generateMetaball(scene) {



  //   for (var corner = 0; corner < 8; corner++) {
  //     // console.log("Corners " + corner + ": " + vec3ToString(corners[corner]) + " for voxelPos: " + vec3ToString(voxelPos));
  //     var dis2 = distanceToSquared(position, corners[corner]);
  //     if (dis2 < radius2) {
  //       LUTIndex = LUTIndex | (1 << corner);
  //     }
  //   }

  //   console.log("LUTIndex: " + LUTIndex);

  //   // 2. Look up the edges
  //   var edges = LUT.EDGE_TABLE[LUTIndex];
  //   console.log("Edge: " + edges);

  //   // 3. Bitwise OR the bit together to look of the number of polygons
  //   console.log(LUT);
  //   var numTri = LUT.TRI_TABLE[LUTIndex];
  //   console.log("Triangle count: " + numTri);


  // }
}


function generateHeights(width, height) {
  var size = width * height;

  var data = new Uint8Array(size);
  var perlin = new Noise.ImprovedNoise();
  var quality = 1;
  var z = Math.random() * 100;
  for (var component = 0; component < 4; ++component) {
    for (var i = 0; i < size; i++) {
      var x = i % width;
      var y = ~~ (i / width);
      data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
    }
    quality *= 5;
  }
  return data;
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
