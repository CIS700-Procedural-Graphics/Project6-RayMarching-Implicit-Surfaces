const THREE = require('three')

// The turtle stuff
var TurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}
  
export default class Turtle {
    constructor(scene, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
        this.scene = scene;
        this.states = [];

        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '[' : this.saveState.bind(this),
                ']' : this.restoreState.bind(this),
                '+' : this.rotateTurtle.bind(this, 30, 0, 0),
                '-' : this.rotateTurtle.bind(this, -30, 0, 0),
                'F' : this.makeCylinder.bind(this, 2, 0.1)
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));        
        this.states = [];
    }

    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    saveState() {
        this.states.push(new TurtleState(this.state.pos, this.state.dir));
    }

    restoreState() {
        var tmp_state = this.states.pop();
        this.state.pos = tmp_state.pos;
        this.state.dir = tmp_state.dir;
    }

    rotateTurtle(x, y, z) {
        var e = new THREE.Euler(
                x * 3.14/180,
                y * 3.14/180,
                z * 3.14/180);
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
    
    renderSymbol(symbol) {
        var func = this.renderGrammar[symbol]; //THIS DOES NOTHING
        if (func) {
            func();
        }
    };

    renderSymbols(lsystemString) {
        for(var i = 0; i < lsystemString.length; i++) {
            this.renderSymbol(lsystemString[i]);
        }
    };
}