
// Credit:
// http://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/
// http://paulbourke.net/geometry/polygonise/

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Noise from './improved_noise.js'
import LUT from './marching_cube_LUT.js'
import Grid from './grid.js'

const DEFAULT_GRID_RES = 4;
const DEFAULT_GRID_WIDTH = 10;
const DEFAULT_NUM_METABALLS = 10;
const DEFAULT_MAX_RADIUS = 1;
const DEFAULT_MAX_SPEED = 0.1;

var App = {
  grid:             undefined,
  config: {
    gridRes:        DEFAULT_GRID_RES,
    gridWidth:      DEFAULT_GRID_WIDTH,
    gridCellWidth:  DEFAULT_GRID_WIDTH / DEFAULT_GRID_RES,
    numMetaballs:   DEFAULT_NUM_METABALLS,
    maxRadius:      DEFAULT_MAX_RADIUS,
    maxSpeed:       DEFAULT_MAX_SPEED
  },
  camera:           undefined,
  scene:            undefined,
  insPointsGrp:     new THREE.Group(),
  cellsGrp:         new THREE.Group()
};

// called after the scene loads
function onLoad(framework) {

  var {scene, camera, renderer, gui, stats} = framework;
  App.scene = scene;
  App.camera = camera;

  renderer.setClearColor( 0xbfd1e5 );
  scene.add(new THREE.AxisHelper(20));

  setupCamera(App.camera);
  setupLights(App.scene);
  setupScene(App.scene);
  setupGUI(gui);
}

// called on frame updates
function onUpdate(framework) {

  if (App.grid !== undefined) {
    App.grid.update();
  }

  if (App.camera !== undefined && App.camera.hasMoved !== undefined) {
    if (App.camera.hasMoved) {
      App.camera.hasMoved = false;
    }
  }
}

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

function setupScene(scene) {
  App.grid = new Grid(App);
}

function setupGUI(gui) {

  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  // --- CONFIG ---
  var GUIControls = function() {
    this.speed = App.config.maxSpeed / 2.0;
    this.samplingCorners = true
  }
  var guiControls = new GUIControls();
  gui.add(guiControls, 'speed', 0, App.config.maxSpeed).onChange(function(value) {

  });

  gui.add(guiControls, 'samplingCorners').onChange(function(value) {
    if (value) {
        App.grid.samplingPoint = EnumSampling.CORNERS;
    } else {
        App.grid.samplingPoint = EnumSampling.CENTER;
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
      App.grid.show();
    } else {
      App.grid.hide();
    }
  });
  debugFolder.add(debug, 'showSpheres').onChange(function(value) {
    if (value) {
      for (var i = 0; i < config.numMetaballs; i++) {
        App.grid.balls[i].show();
      }
    } else {
      for (var i = 0; i < config.numMetaballs; i++) {
        App.grid.balls[i].hide();
      }
    }
  });
  debugFolder.open();  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
