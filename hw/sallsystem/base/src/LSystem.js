const THREE = require('three'); 

export default class LSystem{

  // will follow example from 
  // https://en.wikipedia.org/wiki/L-system#Example_7:_Fractal_plant
    
  constructor(axiom, scene) {
    this.axiom = axiom;
    this.currentState = axiom;
    this.states = [];
    this.currentStatePos = new THREE.Vector3(0, 0, 0);
    this.currentStateRot = new THREE.Vector3(0, 0, 0);
    this.iterationCount = 0;
    this.variables = ["F", "X"];
    this.constants = ["-", "+", "[", "]"];
    this.fRule = "F";
    this.xRule = "[-FX]+FX";
    this.scene = scene;
    this.angle = 30 * (Math.PI/180);
    this.iteration_gui;
    this.state_gui;
    this.cylinderSize = new THREE.Vector3(0.1, 0.1, 0.5);

    this.red = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(1.0, 0.2, 0.1),
      shininess: 50 });
    
    this.yellow = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(0.9, 0.8, 0.1),
      shininess: 50 });

    this.teal = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(0.1, 0.8, 0.9),
      shininess: 50 });

    console.log('L-System instantiated');
    console.log(this);
  }

  setIterationGui(iteration_gui) {
    this.iteration_gui = iteration_gui;
  }

  setStateGui(state_gui) {
    this.state_gui = state_gui;
  }

  updateAxiom(newVal) {
    this.axiom = newVal;
  }

  // Where we parse the string and add meshes to the scene
  drawState() {
    var currentMesh;
    for (var i=0; i < this.currentState.length; i++) {
      var currentLetter = this.currentState[i];
      if (currentLetter === "F") {
        currentMesh = this.drawForward();
        this.scene.add(currentMesh);
        console.log("forward mesh pos");
        console.log(currentMesh.position);
        this.currentStatePos = currentMesh.position;
        this.currentStateRot = currentMesh.rotation;

      } else if (currentLetter === "-") {
        currentMesh = this.turnLeft();
        this.scene.add(currentMesh);
        console.log("turn left mesh pos");
        console.log(currentMesh.position);
        this.currentStatePos = currentMesh.position;
        this.currentStateRot = currentMesh.rotation;

      } else if (currentLetter === "+") {
        currentMesh = this.turnRight();
        this.scene.add(currentMesh);
        this.currentStatePos = currentMesh.position;
        this.currentStateRot = currentMesh.rotation;
      } else if (currentLetter === "[") {
        this.saveState(currentMesh);
      } else if (currentLetter ==="]") {
        this.restoreState();
      }
    }
  }

  drawForward() {
    var geometry = new THREE.CylinderGeometry(
      this.cylinderSize.x, this.cylinderSize.y, this.cylinderSize.z);
   
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation( 
      0, this.cylinderSize.z/2, 0));

    var mesh = new THREE.Mesh(geometry, this.red);
    mesh = this.move(mesh, this.currentStatePos);

    mesh.rotateX(this.currentStateRot.x);
    mesh.rotateY(this.currentStateRot.y);
    mesh.rotateZ(this.currentStateRot.z);

    // var forward = new THREE.Vector3(0, this.cylinderSize.z, 0);
    // // forward.applyEuler(new THREE.Euler(
    // //   this.currentStateRot.x, 
    // //   this.currentStateRot.y, 
    // //   this.currentStateRot.z));
    // mesh = this.move(mesh, forward);

    mesh.translateY(this.cylinderSize.z);

    console.log(mesh.rotation);
    console.log(this.currentStateRot);
    console.log(mesh.position);
    return mesh;
  }

  move(mesh, trans) {
    mesh.translateX(trans.x);
    mesh.translateY(trans.y);
    mesh.translateZ(trans.z);
    return mesh;
  }

  turnLeft() {
    var geometry = new THREE.CylinderGeometry(
      this.cylinderSize.x, this.cylinderSize.y, this.cylinderSize.z);

    geometry.applyMatrix(new THREE.Matrix4().makeTranslation( 
      0, this.cylinderSize.z/2, 0));
  
    var mesh = new THREE.Mesh(geometry, this.yellow);
    mesh = this.move(mesh, this.currentStatePos);
    mesh.translateY(this.cylinderSize.z);
    mesh.rotateX(this.currentStateRot.x);
    mesh.rotateY(this.currentStateRot.y);
    mesh.rotateZ(this.currentStateRot.z + this.angle);
  
    return mesh;
  }

  turnRight() {
    var geometry = new THREE.CylinderGeometry(
      this.cylinderSize.x, this.cylinderSize.y, this.cylinderSize.z);

    geometry.applyMatrix(new THREE.Matrix4().makeTranslation( 
      0, this.cylinderSize.z/2, 0));

    var mesh = new THREE.Mesh(geometry, this.teal);
    mesh = this.move(mesh, this.currentStatePos);
    mesh.translateY(this.cylinderSize.z);
    mesh.rotateX(this.currentStateRot.x);
    mesh.rotateY(this.currentStateRot.y);
    mesh.rotateZ(this.currentStateRot.z-this.angle);
   
    return mesh;
  }

  // consists of angle and position
  saveState(mesh) {
    this.states.push(mesh);
  }

  restoreState() {
    var restoredMesh = this.states.pop();
    this.currentStatePos = new THREE.Vector3(
      restoredMesh.position.x,
      restoredMesh.position.y,
      restoredMesh.position.z);

    this.currentStateRot = new THREE.Vector3(
      restoredMesh.rotation.x,
      restoredMesh.rotation.y,
      restoredMesh.rotation.z);

  }

  step() {
    var updatedState = "";

    console.log("starting with");
    console.log(this.currentState);

    this.currentStatePos = new THREE.Vector3(0, 0, 0);
    this.currentStateRot = new THREE.Vector3(0, 0, 0);

    // apply rules 
    for(var i=0; i < this.currentState.length; i++) {
      var currentLetter = this.currentState[i];  

      if (currentLetter === "F") {
        updatedState += this.fRule;
      } else if (currentLetter === "X") {
        console.log("beforeX");
        console.log(this.currentState);
        console.log(updatedState);
        updatedState += this.xRule;
        console.log(updatedState);
      } else {
        updatedState += currentLetter;
      }
    }

    console.log(updatedState);
    this.currentState = updatedState;
    this.iterationCount += 1;

    this.drawState();
    this.iteration_gui.updateDisplay();
    this.state_gui.updateDisplay();
  }
 
  n_more_steps(iteration_cnt){
    for (var i=0; i < iteration_cnt; i++) {
      this.step();
    }
  }

} 