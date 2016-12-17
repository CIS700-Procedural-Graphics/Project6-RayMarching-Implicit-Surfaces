
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
    var box = new THREE.BoxGeometry(.3, .6, .05);
    var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    // var lambertCube = new THREE.Mesh(box, lambertWhite);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    var path = new THREE.CatmullRomCurve3( [
        new THREE.Vector3( 1, 1, 0 ),
        new THREE.Vector3( 0, 1.1, 0 ),
        new THREE.Vector3( -1, 1, 0 )
    ] );
    // var extrudePath = new THREE.Curves.FigureEightPolynomialKnot();
    var segments = 100;
    var closed = false;
    var radiusSegments = 10;
    var tube = new THREE.TubeBufferGeometry(path, segments, 0.1, radiusSegments, closed);
    var tubeMesh = new THREE.Mesh(tube, lambertWhite);
    // scene.add(tubeMesh);

    var loader = new THREE.OBJLoader();
    loader.load('res/primary.obj', function ( obj ) {
            var featherGeo = obj.children[0].geometry;

            var numSegments = 15;
            for(var i = 0; i < numSegments; i++) {
                var t = (i * i) / ((numSegments - 1) * (numSegments - 1));
                var point = path.getPointAt(t);
                var tangent = path.getTangentAt(t);

                var feather = new THREE.Mesh(featherGeo, lambertWhite);
                feather.position.set(point.x, point.y, point.z);
                var dir = new THREE.Vector3(point.x + tangent.x, point.y + tangent.y, point.z + tangent.z);
                feather.lookAt(dir);
                feather.rotateX(-90 * t * 0.0174533);
                feather.rotateY((-160 - 10 * t) * 0.0174533);
                feather.rotateZ((-85 - 5  * t) * 0.0174533);
                scene.add(feather);
            }

            for(var i = 0; i < numSegments/1.2; i++) {
                var t = (i) / ((numSegments - 1));
                var point = path.getPointAt(t);
                var tangent = path.getTangentAt(t);

                var feather = new THREE.Mesh(featherGeo, lambertWhite);
                feather.position.set(point.x, point.y, point.z);
                var dir = new THREE.Vector3(point.x + tangent.x, point.y + tangent.y, point.z + tangent.z);
                feather.scale.x = 0.4 + 0.1 * (1-t);
                feather.lookAt(dir);
                feather.rotateX(-110 * t * 0.0174533);
                feather.rotateY((-160 - 15 * t) * 0.0174533);
                feather.rotateZ((-90 - 5  * t) * 0.0174533);
                scene.add(feather);
            }
            for(var i = 0; i < numSegments/2; i++) {
                var t = (i) / ((numSegments - 1));
                var point = path.getPointAt(t);
                var tangent = path.getTangentAt(t);

                var feather = new THREE.Mesh(featherGeo, lambertWhite);
                feather.position.set(point.x, point.y, point.z);
                var dir = new THREE.Vector3(point.x + tangent.x, point.y + tangent.y, point.z + tangent.z);
                feather.scale.x = 0.1 + 0.1 * (1-t);
                feather.lookAt(dir);
                feather.rotateZ((-75 + 20 * t) * 0.0174533);
                scene.add(feather);
            }
        }
    );
    

    // set camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });
}

// called on frame updates
function onUpdate(framework) {
    // console.log(`the time is ${new Date()}`);

}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);