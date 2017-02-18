
// Credit:
// http://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/
// http://paulbourke.net/geometry/polygonise/

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import {generateGradientTexture} from './gradient.js'
import LUT from './marching_cube_LUT.js'
import Grid from './grid.js'
import EnumSampling from './grid.js'

const DEFAULT_ISO_LEVEL = 0.7;
const DEFAULT_GRID_RES = 32;
const DEFAULT_GRID_WIDTH = 10;
const DEFAULT_NUM_METABALLS = 10;
const DEFAULT_MIN_RADIUS = 0.5;
const DEFAULT_MAX_RADIUS = 1;
const DEFAULT_MAX_SPEED = 0.2;

var App = {
  grid:             undefined,
  config: {
    isolevel:       DEFAULT_ISO_LEVEL,
    gridRes:        DEFAULT_GRID_RES,
    gridWidth:      DEFAULT_GRID_WIDTH,
    gridCellWidth:  DEFAULT_GRID_WIDTH / DEFAULT_GRID_RES,
    numMetaballs:   DEFAULT_NUM_METABALLS,
    minRadius:      DEFAULT_MIN_RADIUS,
    maxRadius:      DEFAULT_MAX_RADIUS,
    maxSpeed:       DEFAULT_MAX_SPEED
  },
  camera:           undefined,
  scene:            undefined,
  renderer:         undefined,
  composer:         undefined,
  isPaused:         false,
  insPointsGrp:     new THREE.Group(),
  cellsGrp:         new THREE.Group()
};

// called after the scene loads
function onLoad(framework) {

  var {scene, camera, renderer, gui, stats} = framework;
  App.scene = scene;
  App.camera = camera;
  App.renderer = renderer;

  renderer.setClearColor( 0xbfd1e5 );
  // scene.add(new THREE.AxisHelper(20));

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
  camera.position.set(5, 5, 30);
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
  scene.background = generateGradientTexture();
  var points = [];
  for ( var i = 0; i < 10; i ++ ) {
    points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 5 + 2.5, ( i - 5 ) * 2 ) );
  }
  
  var geometry = new THREE.CylinderGeometry( App.config.gridWidth, App.config.gridWidth * 0.7, App.config.gridWidth * 0.5, 32 );
  var material = new THREE.MeshPhongMaterial( { color: 0xffff00, transparent: true, opacity: 0.5 } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.set(App.config.gridWidth / 2.0, 1.0, App.config.gridWidth / 2.0);
  // scene.add( mesh );

  App.grid = new Grid(App);
}

function setupPostProcess(renderer) {
  var GrayscaleShader = new EffectComposer.ShaderPass({
      uniforms: {
          tDiffuse: {
              type: 't',
              value: null
          },
          u_amount: {
              type: 'f',
              value: options.amount
          }
      },
      vertexShader: require('./glsl/pass-vert.glsl'),
      fragmentShader: require('./glsl/grayscale-frag.glsl')
  });  

  // this is the THREE.js object for doing post-process effects
  var composer = new EffectComposer(App.renderer);

  // first render the scene normally and add that as the first pass
  composer.addPass(new EffectComposer.RenderPass(scene, camera));

  // then take the rendered result and apply the GrayscaleShader
  composer.addPass(GrayscaleShader);  

  // set this to true on the shader for your last pass to write to the screen
  GrayscaleShader.renderToScreen = true;

  App.composer = composer;

}

function setupGUI(gui) {

  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  // --- CONFIG ---
  gui.add(App, 'isPaused').onChange(function(value) {
    App.isPaused = value;
    if (value) {
      App.grid.pause();
    } else {
      App.grid.play();
    }
  });

  gui.add(App.grid, 'isSamplingCorner').onChange(function(value) {
    App.grid.isSamplingCorner = value;
  });

  gui.add(App.config, 'numMetaballs', 1, 10).onChange(function(value) {
    App.config.numMetaballs = value;
    App.grid.init(App);
  });

  // --- DEBUG ---

  var debugFolder = gui.addFolder('Grid');
  debugFolder.add(App.grid, 'showGrid').onChange(function(value) {
    App.grid.showGrid = value;
    if (value) {
      App.grid.show();
    } else {
      App.grid.hide();
    }
  });

  debugFolder.add(App.grid, 'showSpheres').onChange(function(value) {
    App.grid.showSpheres = value;
    if (value) {
      for (var i = 0; i < App.config.numMetaballs; i++) {
        App.grid.balls[i].show();
      }
    } else {
      for (var i = 0; i < App.config.numMetaballs; i++) {
        App.grid.balls[i].hide();
      }
    }
  });
  debugFolder.open();  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
