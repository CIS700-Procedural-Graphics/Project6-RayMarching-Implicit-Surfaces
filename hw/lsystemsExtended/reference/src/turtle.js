const THREE = require('three')

// The turtle stuff
var TurtleState = function(pos, scale) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        scale: new THREE.Vector3(scale.x, scale.y, scale.z),
        currentNode: null,
        splitAxis: [],
        addingToActiveSet: false,
        activeSet: []
    }
}
  
export default class Turtle {
    constructor(scene, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));
        this.scene = scene;
        this.states = [];
        this.currentNode = null;

        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '[' : this.saveState.bind(this),
                ']' : this.restoreState.bind(this),
                'S' : this.subdivide.bind(this),
                '{' : this.beginActiveSet.bind(this),
                '}' : this.endActiveSet.bind(this),
                'C' : this.addToActiveSet.bind(this, 'C')
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));        
        this.states = [];
    }

    printState() {
        console.log(this.state.pos)
        console.log(this.state.scale)
    }

    saveState() {
        this.states.push(new TurtleState(this.state.pos, this.state.scale));
    }

    restoreState() {
        var tmp_state = this.states.pop();
        this.state.pos = tmp_state.pos;
        this.state.scale = tmp_state.scale;
    }

    beginActiveSet() {
        console.log('beginActiveSet');
        this.state.addingToActiveSet = true;
    }

    makeCube(position, scale) {
        console.log('makeCube');
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshLambertMaterial( {color: 0x00cccc} );
        var cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );

        // Scale the cube accordingly
        cube.position.set(position, this.state.pos.y, this.state.pos.z);
        cube.scale.set(scale, this.state.scale.y, this.state.scale.z);
    }

    endActiveSet() {
        console.log('endActiveSet');
        this.state.addingToActiveSet = false;

        // Loop through active set and render shapes here
        var numShapes = this.state.activeSet.length;
        var boundX = this.state.scale.x;
        var splitScale = boundX / numShapes;
        var splitFirstOffset = this.state.pos.x - this.state.scale.x / 2.0;
        for (var i = 0; i < numShapes; i++) {
            var position = splitFirstOffset + splitScale / 2.0 + splitScale * i;

            this.makeCube(position, splitScale * 0.7);
        }
    }

    addToActiveSet(shape) {
        console.log('addToActiveSet');
        if (this.state.addingToActiveSet) {
            this.state.activeSet.push(shape);            
        }
    }


    subdivide() {
        console.log('subdivide');
        // Divide along X
        this.state.splitAxis.push('X');
        this.state.scale.set(this.state.scale.x / 2.0, this.state.scale.y / 2.0, this.state.scale.z / 2.0);
    }


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