
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

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
  var cylinder = new THREE.CylinderGeometry(1, 1, 1, 32, 32);
  var material = new THREE.MeshLambertMaterial({
    color: 0x00ff00
  })

  // var light = new THREE.PointLight( 0xffffff, 1, 100 );
  // light.position.set( 50, 50, 50 );
  // scene.add( light );
  var light1 = new THREE.DirectionalLight(0xffffff, 0.8);
  light1.position.set(10, 10, 10);
  

  var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
  light2.position.set(-10, 5, -10);

  var settings = {
    treeHeight: 50,
    leafHeight: 0.56
  }
  
  // set camera position
  camera.position.set(20, 50, 40);
  camera.lookAt(new THREE.Vector3(0,0,0));

  function placeMesh(mesh, abs_y, rel_y) {
    mesh.position.set(0, abs_y, 0);
    var amp = Math.cos(abs_y * 10);
    amp = Math.abs(amp);
    amp = Math.max(0.1, amp);
    var taper = (1 - rel_y);
    var scale = settings.treeHeight / 2 * amp * taper;
    mesh.scale.set(scale, settings.leafHeight, scale);
  }

  function buildTree() {
    scene.children.forEach(function(object){
      scene.remove(object);
    });
    scene.add(light1);
    scene.add(light2);
    for (var i = 0; i < settings.treeHeight; i += settings.leafHeight) {
      var mesh = new THREE.Mesh(cylinder, material);
      placeMesh(mesh, i, i / settings.treeHeight);
      scene.add(mesh);
    }
  }

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  gui.add(settings, 'treeHeight', 0.1, 100).onChange(buildTree);
  gui.add(settings, 'leafHeight', 0.1, 1).onChange(buildTree);

  buildTree();
}

// called on frame updates
function onUpdate(framework) {
  // console.log(`the time is ${new Date()}`);
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);