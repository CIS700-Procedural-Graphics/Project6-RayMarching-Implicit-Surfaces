window.addEventListener( 'load', function() {

	shaderData = new ShaderData();
	var gui = new dat.GUI();
	// gui.add(text, 'message');
	gui.add(shaderData, 'noiseStrength', 0, 20);
	gui.add(shaderData, 'bulgeStrength', 0, 20);
}