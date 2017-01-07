
// Credit:
// http://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/
// http://paulbourke.net/geometry/polygonise/

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Noise from './improved_noise.js'
import LUT from './marching_cube_LUT.js'


// called after the scene loads
function onLoad(framework) {

  // LOOK: the line below is synyatic sugar for the code above. Optional, but I sort of recommend it.
  var {scene, camera, renderer, gui, stats} = framework;

  renderer.setClearColor( 0xbfd1e5 );

  setupCamera(camera);
  setupLights(scene);

  // ===== Construct grid ====== //

  var gridRes = 10;
  var gridWidth = 20;
  var config = {
    gridRes: 10,
    gridWidth: 20,
    gridCellWidth: gridWidth / gridRes,
    numMetaballs: 10,
    maxRadius: 3,
    maxSpeed: 0.10
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
  }
  var guiControls = new GUIControls();
  gui.add(guiControls, 'restart');
  gui.add(guiControls, 'speed', 0, config.maxSpeed).onChange(function(value) {

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
      for (var i = 0; i < numMetaballs; i++) {
        framework.balls[i].show();
      }
    } else {
      for (var i = 0; i < numMetaballs; i++) {
        framework.balls[i].hide();
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

  var SamplingPointEnum = {
    CENTER: 0,
    CORNERS: 1
  };

  // LOOK
  var Cell = function(x, y, z) {

    this.pos = new THREE.Vector3(x, y, z);

    var positions = new Float32Array([
      // Front face
       0.5, 0.5,  0.5,
       0.5, -0.5, 0.5,
      -0.5, -0.5, 0.5,
      -0.5, 0.5,  0.5,

      // Back face
      -0.5,  0.5, -0.5,
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5,  0.5, -0.5,
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
    this.wireframe.scale.set(config.gridCellWidth, config.gridCellWidth, config.gridCellWidth);

    // Green cube
    geo = new THREE.BoxBufferGeometry(config.gridCellWidth, config.gridCellWidth, config.gridCellWidth);
    mat = new THREE.MeshBasicMaterial( { color: 0x00ee00, transparent: true, opacity: 0.5 });
    this.mesh = new THREE.Mesh( geo, mat );
    this.mesh.position.set(x, y, z);
    this.mesh.visible = false;

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

    // Center dot
    geo = new THREE.Geometry();
    geo.vertices.push(new THREE.Vector3( x, y, z));
    mat = new THREE.PointsMaterial( { color: 0, size: 3, sizeAttenuation: false } );
    this.centerMesh = new THREE.Points( geo, mat );
    this.centerMesh.visible = false;

    this.updateLabel = function(screenPos, text, opacity) {
      this.label.style.top = screenPos.y + 'px';
      this.label.style.left = screenPos.x + 'px';
      this.label.innerHTML = text;
      this.label.style.opacity = opacity;
    }

    this.clearLabel = function() {
      this.label.innerHTML = '';
      this.label.style.opacity = 0;
    }
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
  this.samplingPoint = SamplingPointEnum.CENTER;
  this.balls = [];

  this.init = function() {

    for (var i = 0; i < this.res3; i++) {
      var i3 = this.i1toi3(i);
      var pos = this.i3toPos(i3);
      var {x, y, z} = pos;
      var cell = new Cell(x, y, z);

      framework.scene.add(cell.wireframe);
      framework.scene.add(cell.mesh);
      framework.scene.add(cell.centerMesh);
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

    var screenPos;
    var f = 0;

    // Reset grid state
    for (var c = 0; c < this.res3; c++) {
      // Clear cells
      this.cells[c].mesh.visible = false;
      this.cells[c].centerMesh.visible = false;
    }

    if (this.samplingPoint === SamplingPointEnum.CENTER) {
      // -- SAMPLE AT CENTER
      // Color cells that have a sample > 1 at the center
      for (var c = 0; c < this.res3; c++) {
        f = 0;
        for (var b = 0; b < this.balls.length; b++) {
          // Accumulate f for each metaball relative to this cell
          f += this.balls[b].radius2 / this.cells[c].pos.distanceToSquared(this.balls[b].pos);
          if (f > 1) {
            this.cells[c].mesh.visible = true;
            this.cells[c].centerMesh.visible = true;
          }
        }

        if (this.visible === false) {
          this.cells[c].clearLabel();
          continue;
        }
        var i3 = this.i1toi3(c);
        var pos = this.i3toPos(i3);
        var {x, y, z} = pos;

        // Update grid value
        var screenPos = pos.project(this.camera);
        screenPos.x = ( screenPos.x + 1 ) / 2 * window.innerWidth;;
        screenPos.y = - ( screenPos.y - 1 ) / 2 *  window.innerHeight;;
        this.cells[c].updateLabel(screenPos, f.toFixed(2), f - 0.5);
      }
    } else if (this.samplingPoint === SamplingPoint.CORNERS) {

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

  // for (var i = 0; i < size; i++) {

  // // -- populate field by inverse distanceSquared
  //   var dis2 = position.distanceToSquared(new THREE.Vector3(x, y, z));
  //   if (dis2 < radius2) {

  //     // Generate a density value if within range
  //     field[i] = strength / dis2;

  //     if (scene.debug) {
  //       // Draw sphere based on strength
  //       var sphere = new THREE.SphereBufferGeometry(field[i] / 10, 32, 32);
  //       var mesh = new THREE.Mesh(sphere, matLambertWhite);
  //       mesh.position.x = x;
  //       mesh.position.y = y;
  //       mesh.position.z = z;
  //       scene.add(mesh);
  //     }
  //   } else {
  //     field[i] = 0;
  //   }
  // }

  // field = [];
  // for (var i = 0; i < size; i++) {

  //   // 1. Find out what are the 8 values at each cell corner
  //   var i3 = i1toi3(i, width, height, depth);
  //   var voxelPos = i3toPos(i3, voxelWidth, gridOrigin);
  //   var LUTIndex = 0;

  //   // -- Eight corners
  //   var corners = [
  //     new THREE.Vector3(
  //                   voxelPos.x - halfVoxelWidth,
  //                   voxelPos.y - halfVoxelWidth,
  //                   voxelPos.z - halfVoxelWidth
  //                   ),


  //     new THREE.Vector3(
  //                   voxelPos.x - halfVoxelWidth,
  //                   voxelPos.y + halfVoxelWidth,
  //                   voxelPos.z - halfVoxelWidth
  //                   ),

  //     new THREE.Vector3(
  //                   voxelPos.x + halfVoxelWidth,
  //                   voxelPos.y + halfVoxelWidth,
  //                   voxelPos.z - halfVoxelWidth
  //                   ),

  //     new THREE.Vector3(
  //                   voxelPos.x + halfVoxelWidth,
  //                   voxelPos.y - halfVoxelWidth,
  //                   voxelPos.z - halfVoxelWidth
  //                   ),

  //     new THREE.Vector3(
  //                   voxelPos.x - halfVoxelWidth,
  //                   voxelPos.y - halfVoxelWidth,
  //                   voxelPos.z + halfVoxelWidth
  //                   ),

  //     new THREE.Vector3(
  //                   voxelPos.x - halfVoxelWidth,
  //                   voxelPos.y + halfVoxelWidth,
  //                   voxelPos.z + halfVoxelWidth
  //                   ),

  //     new THREE.Vector3(
  //                   voxelPos.x + halfVoxelWidth,
  //                   voxelPos.y + halfVoxelWidth,
  //                   voxelPos.z + halfVoxelWidth
  //                   ),

  //     new THREE.Vector3(
  //                   voxelPos.x + halfVoxelWidth,
  //                   voxelPos.y - halfVoxelWidth,
  //                   voxelPos.z + halfVoxelWidth
  //                   )
  //     ];

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
