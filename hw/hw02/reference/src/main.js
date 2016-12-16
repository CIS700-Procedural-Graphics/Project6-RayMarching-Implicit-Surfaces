
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem from './lsystem.js'


var test = function(arg1) {
  console.log(this);
}

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
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  //scene.add(lambertCube);
  scene.add(directionalLight);

  

    // A wrapper class for the lsystem componenets
    var LSystem = function() {
    this.axiom = 'FX';
    this.grammar = {};
    this.grammar['X'] = [
		 new Lsystem.Rule(1, "[+FX][-FX]") 
		 ]; 
    this.iterations = 0;
    };

    var lsys = new LSystem();


    // The turtle stuff
  var TurtleState = function(pos, dir) {
      this.pos = new THREE.Vector3(pos.x, pos.y, pos.z);
      this.dir = new THREE.Vector3(dir.x, dir.y, dir.z);
  }

  // A turtle class for rendering the lsystem output.
  var Turtle = function() {
    this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
    this.states = [];

    this.printState = function() {
	console.log(this.state.pos);
	console.log(this.state.dir);
    }

    // Push current turtle transformation onto the stack.
     this.saveState = function() {
	 this.states.push(new TurtleState(this.state.pos, this.state.dir));
     }

    // Restore turtle transformation from stack.
     this.restoreState = function() {
	 var tmp_state = this.states.pop();
	 this.state.pos = tmp_state.pos;
	 this.state.dir = tmp_state.dir;
     }

    // Rotate turtle by euler angles x, y, z
    this.rotateTurtle = function(x, y, z) {
	var e = new THREE.Euler(x * 3.14/180,
				y * 3.14/180,
				z * 3.14/180);
	this.state.dir.applyEuler(e);
    };

    // Move the turtle by delta position x, y, z
    this.moveTurtle = function(x, y, z) {
	var new_vec = THREE.Vector3(x, y, z);
	this.state.pos.add(new_vec);
    };

    // Move the turtle by given distance along its forward direction
    this.moveForward = function(dist) {
	var newVec = this.state.dir.multiplyScalar(dist);
	this.state.pos.add(newVec);
    };
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    this.makeCylinder = function(len, width) {
	var geometry = new THREE.CylinderGeometry(width, width, len);
	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	var cylinder = new THREE.Mesh( geometry, material );
	scene.add( cylinder );

	//Orient the cylinder to the turtle's current direction

	var quat = new THREE.Quaternion();
	quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
	var mat4 = new THREE.Matrix4();
	mat4.makeRotationFromQuaternion(quat);
	cylinder.applyMatrix(mat4);


	//Move the cylinder so its base rests at the turtle's current position
	var mat5 = new THREE.Matrix4();
	var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * len));
	mat5.makeTranslation(trans.x, trans.y, trans.z);
	cylinder.applyMatrix(mat5);

	//Scoot the turtle forward by len units
	this.moveForward(len/2);
    };
    
    this.renderGrammar = {
	'[' : this.saveState.bind(this),
	']' : this.restoreState.bind(this),
	'+' : this.rotateTurtle.bind(this, 30, 0, 0),
	'-' : this.rotateTurtle.bind(this, -30, 0, 0),
	'F' : this.makeCylinder.bind(this, 2, 0.1)
    };

    //this.renderGrammar['['] = turtle.saveState;
    //this.renderGrammar[']'] = function() {turtle.restoreState()};
    //this.renderGrammar['F'] = function() {turtle.makeCylinder(2, 0.1)};

    this.renderSymbol = function(symbolNode) {
	var func = this.renderGrammar[symbolNode.character];//THIS DOES NOTHING
	if (func) {
            func();
	}
    };

    this.renderSymbols = function(linkedList) {
	var currentNode;
	for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
	    this.renderSymbol(currentNode);
	}
    } 
  };

    var turtle = new Turtle();






  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
   gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  gui.add(lsys, 'axiom').onChange(function(newVal) {
    turtle = new Turtle();
    doLsystem(newVal, lsys.grammar, lsys.iterations, turtle);
  });
   gui.add(lsys, 'iterations', 1, 12).step(1).onChange(function(newVal) {
    turtle = new Turtle();
    doLsystem(lsys.axiom, lsys.grammar, newVal, turtle);
  });
}

function doLsystem(axiom, grammar, iterations, turtle) {
    //console.log("Doing lsystem");

  // lsystem testing
  var result = Lsystem.IterativeLSystemGeneration(axiom, grammar, iterations);
  turtle.renderSymbols(result);


    var str2 = Lsystem.LinkedListToString(result);
    //console.log(str2);
}

// called on frame updates
function onUpdate(framework) {
  //console.log(`the time is ${new Date()}`);
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
