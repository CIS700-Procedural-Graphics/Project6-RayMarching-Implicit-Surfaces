var container, 
    renderer, 
    scene, 
    camera, 
    mesh, 
    start = Date.now(),
    fov = 30,
    shaderData;
    // noiseStrength;

var ShaderData = function() {
  // this.message = 'dat.gui';
  this.noiseStrength = 10.0;
  this.bulgeStrength = 1.0;
  // this.displayOutline = false;
  // this.explode = function() { ... };
  // Define render logic ...
};

window.addEventListener( 'load', function() {

	shaderData = new ShaderData();
	var gui = new dat.GUI();
	// gui.add(text, 'message');
	gui.add(shaderData, 'noiseStrength', 0, 20);
	gui.add(shaderData, 'bulgeStrength', 0, 20);
	// gui.add(text, 'displayOutline');
	// gui.add(text, 'explode');

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
            tExplosion: {
                type: "t", 
                value: THREE.ImageUtils.loadTexture( 'explosion.png' )//pyroclastic_gradients
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

    // material.uniforms[ 'time' ].value = .00025 * ( shaderData.noiseStrength );
    material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
    material.uniforms[ 'noiseStrength' ].value = shaderData.noiseStrength;
    material.uniforms[ 'bStrength' ].value = shaderData.bulgeStrength;
    renderer.render( scene, camera );
    requestAnimationFrame( render );
    
}