const THREE = require('three')

// The turtle stuff
var TurtleState = function(pos, dir, scale) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z),
        scale: new THREE.Vector3(scale.x, scale.y, scale.z),
        activeShapes: []
    }
}
  
export default class Turtle {
    constructor(scene, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), 
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(1,1,1));
        this.scene = scene;
        this.currentNode = null;
        this.states = [];
        this.cubeCount = 0;
        this.subdivision = 0;

        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '[' : this.saveState.bind(this),
                ']' : this.restoreState.bind(this),
                '+' : this.rotateTurtle.bind(this, 25, 0, 0),
                '-' : this.rotateTurtle.bind(this, -25, 0, 0),
                '<' : this.randRotateTurtle.bind(this, 0.15, 0.5, 0),
                '>' : this.randRotateTurtle.bind(this, -0.15, -0.5, 0),
                'C' : this.makeCube.bind(this, 2, 0.1),
                'S' : this.subdivide.bind(this)
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    clear() {
        this.state = new TurtleState(
            new THREE.Vector3(0,0,0), 
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(1,1,1));        
        this.states = [];
    }

    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    saveState() {
        this.states.push(new TurtleState(
            this.state.pos, 
            this.state.dir, 
            this.state.scale));
    }

    restoreState() {
        if (this.states.length > 0) {
             var tmp_state = this.states.pop();
            this.state.pos = tmp_state.pos;
            this.state.dir = tmp_state.dir;
            this.state.scale = tmp_state.scale;
        }
    }

    rotateTurtle(x, y, z) {
        var e = new THREE.Euler(
                x * 3.14/180,
                y * 3.14/180,
                z * 3.14/180);
        this.state.dir.applyEuler(e);
    }

    randRotateTurtle(x, y, z) {
        var e = new THREE.Euler(
                x * 3.14/180 * Math.random() * 360,
				y * 3.14/180 * Math.random() * 360,
				z * 3.14/180 * Math.random() * 360);
        this.state.dir.applyEuler(e);
    }

    moveTurtle(x, y, z) {
        var new_vec = THREE.Vector3(x, y, z);
        this.state.pos.add(new_vec);
    };

    moveForward(dist) {
        var newVec = this.state.dir.multiplyScalar(dist);
        this.state.pos.add(newVec);
    };
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(len, width) {

        var geometry = new THREE.CylinderGeometry(width, width, len);
        var material = new THREE.MeshBasicMaterial( {color: 0x00cccc} );
        var cylinder = new THREE.Mesh( geometry, material );
        this.scene.add( cylinder );

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

    makeCube(side) {
        var cubeState = this.state;

        if (this.states.length > 0) {
            cubeState = this.states.pop();
            this.state = cubeState;
        }

        var geometry = new THREE.BoxGeometry(
            cubeState.scale.x, 
            cubeState.scale.y,
            cubeState.scale.z);
        var material = new THREE.MeshPhongMaterial( {
            color: 0xbbbbbb,
            emissive: 0x008888} );
        var cube = new THREE.Mesh( geometry, material );

        cube.position.set(cubeState.pos.x, cubeState.pos.y, cubeState.pos.z)
        this.scene.add( cube );
        this.cubeCount += 1;
    };

    subdivide() {
        var temp_state = this.state;
        var new_neg_pos = new THREE.Vector3(
            -temp_state.scale.x/2.0 + temp_state.pos.x,
            temp_state.pos.y + 1.0,
            temp_state.pos.z); 

        var new_pos_pos = new THREE.Vector3(
            temp_state.scale.x/2.0 + temp_state.pos.x,
            temp_state.pos.y + 1.0,
            temp_state.pos.z); 

        var new_scale = new THREE.Vector3(
            temp_state.scale.x * 0.4,
            temp_state.scale.y,
            temp_state.scale.z); 

        this.state.scale = new_scale;

        this.states.push(new TurtleState(new_neg_pos, this.state.dir, new_scale));
        this.states.push(new TurtleState(new_pos_pos, this.state.dir, new_scale));
        this.subdivision += 1;
    };

    renderSymbol(symbolNode) {
        this.currentNode = symbolNode;
        var symbol = symbolNode.character;
        var func = this.renderGrammar[symbol];
        if (func) {
            func();
        }
    };

    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.renderSymbol(currentNode);
        }
    }
}