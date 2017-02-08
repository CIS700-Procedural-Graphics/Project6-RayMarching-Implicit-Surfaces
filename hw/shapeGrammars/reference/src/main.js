
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {LinkedListToString, Rule} from './lsystem.js'
import Turtle from './turtle.js'

console.log(Lsystem)

var test = function(arg1) {
  console.log(this);
}

var turtle;

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // LOOK: the line below is synyatic sugar for the code above. Optional, but I sort of recommend it.
  // var {scene, camera, renderer, gui, stats} = framework; 

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  // directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1,3,2);
  directionalLight.position.multiplyScalar(10);
 
  //ground
  var groundGeo = new THREE.PlaneBufferGeometry( 3000, 1500 );
  var groundMat = new THREE.MeshPhongMaterial( { color: 0xC5E3ED } );

  var ground = new THREE.Mesh( groundGeo, groundMat );
  ground.rotation.x = -Math.PI/2;
  ground.position.y = 0;
  scene.add( ground );

  // set camera position
  camera.position.set(-130, 60, 680);
  // camera.lookAt(new THREE.Vector3(0,10,0));

  //scene.add(lambertCube);
  scene.add(directionalLight);
  var lsys = new Lsystem();
  turtle = new Turtle(scene);
  doLsystem(lsys, lsys.iterations, turtle);

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

   gui.add(lsys, 'iterations', 0, 12).step(1).onChange(function(newVal) {
    clearScene(turtle);
    doLsystem(lsys, newVal, turtle);
  });
}

function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 1; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle) {
    // lsystem testing
    var result = lsystem.DoIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene);
    console.log(result);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
  // console.log(framework.camera.position);
  //console.log(`the time is ${new Date()}`);
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
