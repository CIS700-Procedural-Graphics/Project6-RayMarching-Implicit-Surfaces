
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

import {func1, func2, func3, func4} from './distribution'

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
  var cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 32);
  cylinder.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));
  var material = new THREE.MeshLambertMaterial({ color: 0x55ff55 })

  var light1 = new THREE.DirectionalLight(0xffffff, 0.8);
  light1.position.set(10, 10, 10);
  
  var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
  light2.position.set(-10, 5, -10);

  var light3 = new THREE.AmbientLight( 0x404040 );

  scene.add(light1);
  scene.add(light2);
  scene.add(light3);

  var grid = new THREE.GridHelper(50, 100);
  grid.rotateX(Math.PI / 2);
  grid.position.set(0,50,0);
  scene.add(grid);

  var settings = {
    treeHeight: 50,
    leafHeight: 0.1
  }

  var tree_items = [];

  function buildTree() {
    tree_items.forEach(function(object) {
      scene.remove(object);
    })
    tree_items = [];

    for (var i = 0; i < settings.treeHeight; i += settings.leafHeight) {
      var mesh = new THREE.Mesh(cylinder, material);
      var params = {
        min: 0,
        max: settings.treeHeight,
        pos: i,
        size: settings.leafHeight
      };

      func1(mesh, params);
      // func2(mesh, settings);
      // func3(mesh, settings);
      // func4(mesh, settings);
      
      scene.add(mesh);
      tree_items.push(mesh);
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
  // console.log(framework.camera)
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);