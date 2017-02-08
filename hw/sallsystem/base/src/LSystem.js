const THREE = require('three'); 

export default class LSystem{

  // will follow example from 
  // https://en.wikipedia.org/wiki/L-system#Example_7:_Fractal_plant
    
  constructor(axiom, scene) {
    this.axiom = axiom;
    this.currentState = axiom;
    this.states = [];
    this.currentStatePos = new THREE.Vector3(0, -10, 0);
    this.currentStateRot = new THREE.Vector3(0, 0, 0);
    this.iterationCount = 0;
    this.variables = ["F", "X"];
    this.constants = ["-", "+", "[", "]"];
    this.fRule = "FF";
    this.xRule = "F-[[X]+X]+F[+FX]-X";
    this.scene = scene;
    this.angle = 30 * (Math.PI/180);
    this.copyCount = 0;
    this.cylinderSize = new THREE.Vector3(0.1, 0.1, 0.8);
  
    this.white = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(0.7, 0.7, 0.8),
      emissive: new THREE.Color(0.95, 0.95, 0.95),
      emissiveIntensity: 0.5,
      shininess: 50 });
    
    this.red = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(0.9, 0.1, 0),
      shininess: 50 });

    this.teal = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(0.1, 0.8, 0.9),
      shininess: 50 });

    console.log('L-System instantiated');
    console.log(this);
  }

  updateAxiom(newVal) {
    this.axiom = newVal;
  }

  // Where we parse the string and add meshes to the scene
  drawState() {
    var currentMesh;
    this.clearScene();
    for (var i=0; i < this.currentState.length; i++) {
      var currentLetter = this.currentState[i];
      if (currentLetter === "F") {
        currentMesh = this.drawForward();
        this.scene.add(currentMesh);
        this.currentStatePos = currentMesh.position;
        this.currentStateRot = currentMesh.rotation;

      } else if (currentLetter === "-") {
        currentMesh = this.turnLeft();
        this.scene.add(currentMesh);
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

    var mesh = new THREE.Mesh(geometry, this.white);
    mesh = this.moveMesh(mesh, this.currentStatePos);

    mesh.rotateX(this.currentStateRot.x);
    mesh.rotateY(this.currentStateRot.y);
    mesh.rotateZ(this.currentStateRot.z);

    // move forward 
    mesh.translateY(this.cylinderSize.z);
    return mesh;
  }         

  moveMesh(mesh, trans) {
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
  
    var mesh = new THREE.Mesh(geometry, this.white);
    mesh = this.moveMesh(mesh, this.currentStatePos);
    mesh.rotateX(this.currentStateRot.x);
    mesh.rotateY(this.currentStateRot.y);
    mesh.rotateZ(this.currentStateRot.z);

    // left and up
    mesh.translateY(this.cylinderSize.z);
    mesh.rotateZ(this.angle);

    mesh.rotateX((Math.random() - 0.5)*0.5);
  
    return mesh;
  }

  turnRight() {
    var geometry = new THREE.CylinderGeometry(
      this.cylinderSize.x, this.cylinderSize.y, this.cylinderSize.z);

    geometry.applyMatrix(new THREE.Matrix4().makeTranslation( 
      0, this.cylinderSize.z/2, 0));

    var mesh = new THREE.Mesh(geometry, this.white);
    mesh = this.moveMesh(mesh, this.currentStatePos);
    mesh.rotateX(this.currentStateRot.x);
    mesh.rotateY(this.currentStateRot.y);
    mesh.rotateZ(this.currentStateRot.z);

    // right and up
    mesh.translateY(this.cylinderSize.z);
    mesh.rotateZ(-this.angle);

    mesh.rotateX((Math.random() - 0.5)*0.5);
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

  clearScene() {
    var meshes = [];
    for(var object in this.scene.children) {
      if (this.scene.children[object].type === "Mesh") {
        meshes.push(this.scene.children[object]);
      }
    }

    for (var i in meshes) {
      this.scene.remove(meshes[i]);
    }
  }

  resetScene(){
    this.iterationCount = 1;
    this.currentStatePos = new THREE.Vector3(0, -10, 0);
    this.currentStateRot = new THREE.Vector3(0, 0, 0);
    this.cylinderSize = new THREE.Vector3(0.1, 0.1, 0.8);
    this.clearScene();
    this.axiom = "FX";
    this.currentState = this.axiom;
    this.drawState();
  }

  step() {
    var updatedState = "";
    this.clearScene();
    this.currentStatePos = new THREE.Vector3(0, -10, 0);
    this.currentStateRot = new THREE.Vector3(0, 0, 0);
    this.cylinderSize = new THREE.Vector3(0.1, 0.1, 0.8);

    // apply rules 
    for(var i=0; i < this.currentState.length; i++) {
      var currentLetter = this.currentState[i];  

      if (currentLetter === "F") {
        updatedState += this.fRule;
      } else if (currentLetter === "X") {
        updatedState += this.xRule;
      } else {
        updatedState += currentLetter;
      }
    }

    this.currentState = updatedState;
    this.iterationCount += 1;

    this.drawState();
  }
 
  n_more_steps(iteration_cnt){
    for (var i=0; i < iteration_cnt; i++) {
      this.step();
    }
  }

} 