const THREE = require('three')
  
export default class Turtle {

    constructor(scene, grammar) {
        this.scene = scene;
    }

    clear() {
    };

    makeCube(shapeNode) {
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshLambertMaterial( {
            emissive: 0x005555,
            color: 0xeeeeee
        } );
        var cube = new THREE.Mesh( geometry, material );
        cube.castShadow = true;
        cube.position.set(shapeNode.pos.x, shapeNode.pos.y + shapeNode.scale.y/2, shapeNode.pos.z);
        cube.scale.set(shapeNode.scale.x, shapeNode.scale.y, shapeNode.scale.z);

        this.scene.add( cube );
    };

    renderSymbols(shapes) {
        for(var i = 0; i < shapes.length; i++) {
            console.log(shapes[i]);
            if(shapes[i].geometry === "cube") {
                this.makeCube(shapes[i]);
            }
        }
    }
}