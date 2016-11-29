
require('../style/main.less')

const THREE = require('three')
import DAT from 'dat-gui'
import Scene from '../framework/scene'
import BioCrowds from './biocrowds'
import Agent from './agent'

function initializeScene(callback) {
  var plane = new THREE.PlaneGeometry(50, 50);
  var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  var groundPlane = new THREE.Mesh(plane, lambertWhite);
  groundPlane.rotateX(-Math.PI/2)

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  var scene = new Scene(function() {
    scene.scene.add(groundPlane);
    scene.scene.add(directionalLight);

    scene.camera.fov = 45
    scene.camera.position.set(1, 1, 2);
    scene.camera.position.multiplyScalar(30);
    scene.camera.lookAt(new THREE.Vector3(0,0,0));
    scene.camera.updateProjectionMatrix();

    callback(scene)
  });
}

initializeScene(function(scene) {

  // initialize BioCrowds
  let bioCrowds = new BioCrowds(scene)

  // LOOK: here's an example of how you might add agents
  for (let i = 0; i < 10; ++i) {
    let agent = new Agent()
    bioCrowds.addAgent(agent)
  }

  // start the simulation
  bioCrowds.start()

  // create functions to generate scenes here
  let sceneGenerators = {
    circle: function() {
      alert('TODO: Generate circle scene')
    }
  }

  bioCrowds.stats.setMode(1)
  bioCrowds.stats.domElement.style.position = 'absolute';
  bioCrowds.stats.domElement.style.left = '0px';
  bioCrowds.stats.domElement.style.top = '0px';
  document.body.appendChild(bioCrowds.stats.domElement)

  var gui = new DAT.GUI();

  // add controls to call the start/stop/restart functions on BioCrowds
  let controls = gui.addFolder('Controls')
  controls.add(bioCrowds, 'start')
  controls.add(bioCrowds, 'stop')
  controls.add(bioCrowds, 'restart')
  controls.open()

  // add controls to call scene generation functions
  let scenes = gui.addFolder('Scenes')
  scenes.add(sceneGenerators, 'circle')
  scenes.open()
})

