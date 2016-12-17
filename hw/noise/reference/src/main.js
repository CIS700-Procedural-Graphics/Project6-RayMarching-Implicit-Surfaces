
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

var startTime = Date.now();

var shaderData = {
  noiseStrength: 10.0,
  bulgeStrength: 1.0,
};

var noiseMaterial = new THREE.ShaderMaterial({
  uniforms: {
    tExplosion: {
      type: "t", 
      value: THREE.ImageUtils.loadTexture('./explosion.png') //pyroclastic_gradients
    },
    time: { // float initialized to 0
      type: "f", 
      value: 0.0 
    },
    noiseStrength: { // float initialized to 0
      type: "f", 
      value: 0.0 
    },
    bStrength: { // float initialized to 0
      type: "f", 
      value: 0.0 
    }
  },
  vertexShader: require('./noise-vert.glsl'),
  fragmentShader: require('./noise-frag.glsl')
})

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // LOOK: the line below is synyatic sugar for the code above. Optional, but I sort of recommend it.
  // var {scene, camera, renderer, gui, stats} = framework; 

  // initialize the mesh
  var mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry( 20, 6 ),
    noiseMaterial
  );
  scene.add(mesh)

  // set camera position
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(shaderData, 'noiseStrength', 0, 20);
	gui.add(shaderData, 'bulgeStrength', 0, 20);
}

// called on frame updates
function onUpdate(framework) {
  noiseMaterial.uniforms['time'].value = .00025 * (Date.now() - startTime);
  noiseMaterial.uniforms['noiseStrength'].value = shaderData.noiseStrength;
  noiseMaterial.uniforms['bStrength'].value = shaderData.bulgeStrength;
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);