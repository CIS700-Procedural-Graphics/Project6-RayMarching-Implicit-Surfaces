require('file-loader?name=[name].[ext]!../index.html');

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE)

import DAT from 'dat-gui'
import Stats from 'stats-js'
// import * as Shaders from './shaders'
// import * as Post from './post'
import {objLoaded} from './mario'
import {setupGUI} from './setup'

DAT.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}

DAT.GUI.prototype.emptyFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  for (let i = 0; i < folder.__controllers.length; ++i) {
      folder.__controllers[i].remove();
  }
  folder.__controllers.length = 0;
  this.onResize();
}

window.addEventListener('load', function() {
    var stats = new Stats();
    stats.setMode(1);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x999999, 1.0);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 2.0;

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    var mesh;
    var mesh, shader, post;
    function shaderSet(Shader, gui) {
        shader = new Shader(renderer, scene, camera);
        shader.initGUI(gui);

        if (mesh) scene.remove(mesh);
        objLoaded.then(function(geo) {
            mesh = new THREE.Mesh(geo, shader.material);
            scene.add(mesh);
        });
    }

    function postProcessSet(Post, gui) {
        post = new Post(renderer, scene, camera);
        post.initGUI(gui);
    }

    setupGUI(shaderSet, postProcessSet);

    objLoaded.then(function(geo) {
        camera.position.set(5, 10, 15);
        const center = geo.boundingSphere.center;
        camera.lookAt(center);
    });

    (function tick() {
        controls.update();
        stats.begin();
        if (shader && shader.update) shader.update();
        if (post && post.update) post.update();
        if (post) post.render();
        stats.end();
        requestAnimationFrame(tick);
    })();
});