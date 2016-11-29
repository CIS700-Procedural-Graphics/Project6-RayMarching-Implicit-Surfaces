
const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)

export default class Scene {
  constructor(callback) {

    // wait till the window loads before initializing
    window.addEventListener('load', () => {
      // initialize the scene
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
      this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
      this.scene  = new THREE.Scene();
      
      // set up renderer params
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x020202, 0);

      // set up camera controls
      let controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = true;
      controls.target.set(0, 0, 0);
      controls.rotateSpeed = 0.3;
      controls.zoomSpeed = 1.0;
      controls.panSpeed = 2.0;

      // render the scene
      this.render();

      document.body.appendChild(this.renderer.domElement);
      callback()
    });
    
    // add an event listener to resize the canvas on window resize
    window.addEventListener('resize', e => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}