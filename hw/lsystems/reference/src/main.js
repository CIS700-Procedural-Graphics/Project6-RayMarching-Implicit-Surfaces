
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'

console.log(Lsystem)

var test = function(arg1) {
  console.log(this);
}

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
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  //scene.add(lambertCube);
  scene.add(directionalLight);

  var lsys = new Lsystem();
  var turtle = new Turtle(scene);

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
   gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  gui.add(lsys, 'axiom').onChange(function(newVal) {
    lsys.Update(newVal, null);
    doLsystem(lsys, lsys.iterations, turtle);
  });
   gui.add(lsys, 'iterations', 0, 12).step(1).onChange(function(newVal) {
    doLsystem(lsys, newVal, turtle);
  });
}

function doLsystem(lsystem, iterations, turtle) {
    //console.log("Doing lsystem");

    //Clear scene

    var obj;
    for( var i = turtle.scene.children.length - 1; i > 3; i--) {
        obj = turtle.scene.children[i];
        turtle.scene.remove(obj);
    }

    // lsystem testing
    var result = lsystem.DoIterations(iterations);
    turtle.clear();
    var turtle2 = new Turtle(turtle.scene);
    turtle2.renderSymbols(result);

    var str2 = LinkedListToString(result);
    //console.log(str2);
}

// called on frame updates
function onUpdate(framework) {
  //console.log(`the time is ${new Date()}`);
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
