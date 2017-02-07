const THREE = require('three')

export function Rule(prob, str)
{
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

export function ShapeNode(geom, pos, scale) {
	this.geometry = geom;
	this.pos = pos;
	this.scale = scale;
	this.terminal = false;
}

function subdivideX(shape) {
	var parentPos = new THREE.Vector3(shape.pos.x, shape.pos.y, shape.pos.z);
	var parentScale = new THREE.Vector3(shape.scale.x, shape.scale.y, shape.scale.z);
	var geom = shape.geometry;

	var childrenScale = new THREE.Vector3(
		parentScale.x * 0.45, parentScale.y, parentScale.z);

	var child1Pos = new THREE.Vector3(
		parentPos.x - parentScale.x/2, parentPos.y, parentPos.z);

	var child2Pos = new THREE.Vector3(
		parentPos.x + parentScale.x/2, parentPos.y, parentPos.z);

	var child1 = new ShapeNode(geom, child1Pos, childrenScale);
	var child2 = new ShapeNode(geom, child2Pos, childrenScale);

	return [child1, child2];
}

function subdivideZ(shape) {
	var parentPos = new THREE.Vector3(shape.pos.x, shape.pos.y, shape.pos.z);
	var parentScale = new THREE.Vector3(shape.scale.x, shape.scale.y, shape.scale.z);
	var geom = shape.geometry;

	var childrenScale = new THREE.Vector3(
		parentScale.x, parentScale.y, parentScale.z * 0.45);

	var child1Pos = new THREE.Vector3(
		parentPos.x, parentPos.y, parentPos.z - parentScale.z/4);

	var child2Pos = new THREE.Vector3(
		parentPos.x, parentPos.y, parentPos.z + parentScale.z/4);

	var child1 = new ShapeNode(geom, child1Pos, childrenScale);
	var child2 = new ShapeNode(geom, child2Pos, childrenScale);

	return [child1, child2];
}

function subdivide(shape) {
	var result = [];
	var rand = Math.random();
	if (rand < 0.5) {
		result = result.concat(subdivideX(shape));
	} else {
		result = result.concat(subdivideZ(shape));
	}
	return result;
}

function tower(shape) {
	var parentPos = new THREE.Vector3(shape.pos.x, shape.pos.y, shape.pos.z);
	var parentScale = new THREE.Vector3(shape.scale.x, shape.scale.y, shape.scale.z);
	var geom = shape.geometry;

	var childrenScale = new THREE.Vector3(
		parentScale.x * 0.6, parentScale.y * 1.3, parentScale.z * 0.6);

	var childPos = new THREE.Vector3(
		parentPos.x, 
		parentPos.y + 0.5*childrenScale.y, 
		parentPos.z);

	var parent = new ShapeNode(geom, parentPos, parentScale);
	var child = new ShapeNode(geom, childPos, childrenScale);
	// parent.terminal = true;
	// shape.terminal = true;

	return [parent, child];
}

export default function Lsystem(axiom, grammar, iterations)
{
	this.iterations = 0;
	// Return results of lsystem after num iterations
	this.DoIterations = function(num)
	{
		this.shapes = [new ShapeNode("cube",
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(100, 20, 100))];

		var m = 9.0;
		for (var i = -m; i < m; i++) {
			for (var j = -m/2; j < m/2; j++) {
				this.shapes.push(new ShapeNode("cube",
					new THREE.Vector3(i * 110, 0, j * 110),
					new THREE.Vector3(100, 20, 100)));
			}
		}

		
		for (var n = 0; n < num; n++) {
			var result = [];

			var count = this.shapes.length;
			for (var i = 0; i < count; i++) {
				var currentShape = this.shapes.pop();
				if(currentShape.terminal) {
					this.shapes.push(currentShape);
				} else {
					var currentRan = Math.random();
					if (currentRan < 0.3) {
						result = result.concat(tower(currentShape));
					} else {
						result = result.concat(subdivide(currentShape));
					} 
				}
				
			}

			this.shapes = this.shapes.concat(result);
			// console.log(this.shapes);
			
		}
		return this.shapes;

	}
}