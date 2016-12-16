var container, 
    renderer, 
    scene, 
    camera, 
    mesh, 
    start = Date.now(),
    fov = 30,
    shaderData;

var ShaderData = function() {
  this.noiseStrength = 10.0;
};

window.addEventListener( 'load', function() {

	shaderData = new ShaderData();
	var gui = new dat.GUI();
	gui.add(shaderData, 'noiseStrength', 0, 20);//This presently does nothing as it is not connected to the shader

    // grab the container from the DOM
    container = document.getElementById( "container" );
    
    // create a scene
    scene = new THREE.Scene();

    // create a camera the size of the browser window
    // and place it 100 units away, looking towards the center of the scene
    camera = new THREE.PerspectiveCamera( 
        fov, 
        window.innerWidth / window.innerHeight, 
        1, 
        10000 );
    camera.position.z = 100;
    camera.target = new THREE.Vector3( 0, 0, 0 );

    scene.add( camera );

    // create a wireframe material		
    material = new THREE.ShaderMaterial( {

        uniforms: { 
            time: { // float initialized to 0
                type: "f", 
                value: 0.0 
            }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    
    } );
    
    // create a sphere and assign the material
    mesh = new THREE.Mesh( 
        new THREE.IcosahedronGeometry( 20, 6 ), 
        material 
    );
    scene.add( mesh );
    
    // create the renderer and attach it to the DOM
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff, 1);
    
    container.appendChild( renderer.domElement );

    render();

} );

function render() {
    material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
    renderer.render( scene, camera );
    requestAnimationFrame( render );
    
}