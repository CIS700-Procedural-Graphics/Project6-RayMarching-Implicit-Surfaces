require('file-loader?name=[name].[ext]!../index.html');

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE)

import DAT from 'dat-gui'
import Stats from 'stats-js'
import ProxySpheres from './proxy_spheres'
import RayMarcher from './rayMarching'

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
    document.body.appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 2.0;

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var gui = new DAT.GUI();

    var options = {
        strategy: '3D'
    }

    gui.add(options, 'strategy', ['3D', 'Ray Marching', 'Marching Cubes']);

    scene.add(new THREE.AxisHelper(20));
    scene.add(new THREE.DirectionalLight(0xffffff, 1));

    var proxySpheres = new ProxySpheres(new THREE.Vector3(5, 5, 5));
    for (let i = 0; i < 5; ++i) {
        proxySpheres.addSphere(Math.random() + 1);
    }
    scene.add(proxySpheres.group);

    camera.position.set(5, 10, 15);
    camera.lookAt(new THREE.Vector3(0,0,0));
    controls.target.set(0,0,0);
    
    var rayMarcher = new RayMarcher(renderer, scene, camera);

    (function tick() {
        controls.update();
        stats.begin();
        proxySpheres.update();
        if (options.strategy === '3D') {
            renderer.render(scene, camera);
        } else if (options.strategy === 'Ray Marching') {
            rayMarcher.render(proxySpheres.buffer);
        }
        stats.end();
        requestAnimationFrame(tick);
    })();
});