
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import LSystem from './LSystem'

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  var lSystem = new LSystem("FX", scene);
  lSystem.drawState();

  window.THREE = THREE;  

  // LOOK: the line below is synyatic sugar for the code above. Optional, but I sort of recommend it.
  // var {scene, camera, renderer, gui, stats} = framework; 

  // initialize a simple box and material
  var box = new THREE.BoxGeometry(1, 1, 1);
  var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  var lambertCube = new THREE.Mesh(box, lambertWhite);
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  // set camera position
  camera.position.set(0, 2, 3);
  camera.lookAt(new THREE.Vector3(0,2,-3));

  scene.add(directionalLight);

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(lSystem, 'axiom').onChange(function(newVal) {
    lSystem.updateAxiom(newVal);
  });

  gui.add(lSystem, 'step');
  var iteration_gui = gui.add(lSystem, 'iterationCount');
  lSystem.setIterationGui(iteration_gui);

  var state_gui = gui.add(lSystem, 'currentState');
  lSystem.setStateGui(state_gui);
}

// called on frame updates
function onUpdate(framework) {
  // console.log(`the time is ${new Date()}`);
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);