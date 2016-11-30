var dict = {};//Maps from char to Rule[]

var scene, camera, renderer;
var geometry, material, mesh;
var startTime;

var grammar;

function Rule(prob, str)
{
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

function Node(symbol) // Node for a linked list of grammar symbols
{
	this.next = null;
	this.character = symbol;
}

function LinkedList()
{
	this.head = null;
	this.tail = null;
}

var GUI = function()
{
	//TODO: Add GUI variables as needed
	//e.g. this.noiseStrength = 10.0;
}

//            Node   Map of rules
function Apply(prevNode, grammar)
{
	var symbol = prevNode.next.character;
	var rulesArray = grammar[symbol];

	var unifRand = Math.random();
	var tmp = 0;
	var rule = null;

	for(var i = 0; i < length(rulesArray); i++)
	{
		tmp += rulesArray[i].probability;
		if(unifRand < tmp)
		{
			rule = rulesArray[i];
			break;
		}
	}
	ReplaceNode(prevNode, rule.successorString);
}

function MakeSymbolLinkedList(input_string) {
	var result = new LinkedList();

	var root_node = new Node(input_string[0]);

	// "pointer" to current node?
	var current_node = root_node;

	for (var i = 1; i < input_string.length; ++i) {
		var new_node = new Node(input_string[i]);
		current_node.next = new_node;
		current_node = new_node;
	}
	result.head = root_node;
	result.tail = current_node;
	return result;
}

function LinkedListToString(linkedList)
{
	var result = "";
	var currentNode;
	for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next)
	{
		result = result.concat(currentNode.character);
	}
	return result;
}

//Given the node just before the node to be replaced, insert a sub-linked-list that represents replacementString
function ReplaceNode(prevNode, replacementString)
{
	var lList = MakeSymbolLinkedList(replacementString);
	var finalNext = prevNode.next.next; // The head of the linked list we're going to append after lList
	prevNode.next = lList.head;
	lList.tail.next = finalNext;
}

var scene, camera, renderer;
var geometry, material, mesh;
var startTime;


window.onload = function()
{
	init();
	animate();
}


function init()
{
	var str = "ABABCDE";
	var head = MakeSymbolLinkedList(str);
	var midNode = head.head;
	for(var i = 0; i < 3; i++)
	{
		midNode = midNode.next;
	}
	ReplaceNode(midNode, "BUTTS");
	var str2 = LinkedListToString(head);

	console.log(str);
	console.log(str2);


	startTime = Date.now();

	scene = new THREE.Scene();

									//FOV, aspect, nearclip, farclip
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
										 1, 10000);
	camera.position.z = 5;
	camera.position.x = 5;
	camera.position.y = 5;
	var ref = new THREE.Vector3(0,0,0);
	camera.lookAt(ref);

	geometry = makeDisplacedPlane(Date.now() - startTime);//new THREE.PlaneGeometry(1, 1, 50, 50);
	material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});

	mesh = new THREE.Mesh(geometry, material);
	// mesh.rotation.set(new THREE.Vector3(Math.PI/2, 0, 0));
	// mesh.rotateX(-Math.PI/2);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);
}

function animate()
{
	requestAnimationFrame( animate );

	//Alter our mesh
	geometry = makeDisplacedPlane(Date.now() - startTime);
	// console.log(Date.now() - startTime);

	renderer.render( scene, camera );
}

function makeDisplacedPlane(time)
{
	plane = new THREE.Geometry();

	// plane.vertices.push(new THREE.Vector3(0,0,0));
	// plane.vertices.push(new THREE.Vector3(1,0,0));
	// plane.vertices.push(new THREE.Vector3(0,0,1));


	//Set up vertex positions
	var x; var z;
	var scale = 5;
	for(x = 0; x < 50; x++)
	{
		for(z = 0; z < 50; z++)
		{
			var pX = (x - 25) / 50.0 * scale;
			var pY = perlin2D(x, z, time);
			var pZ = (z - 25) / 50.0 * scale;
			plane.vertices.push(new THREE.Vector3(pX, pY, pZ));
		}
	}

	// plane.faces.push(new THREE.Face3(0,1,2));

	//Set up indices per face
	for(x = 0; x < 49; x++)
	{
		for(z = 0; z < 49; z++)
		{
			plane.faces.push(new THREE.Face3(x + z*50, x + 1 + z*50, x + 1 + (z + 1)*50));
			plane.faces.push(new THREE.Face3(x + z*50, x + 1 + (z + 1)*50, x + (z + 1)*50));
		}
	}

	return plane;
}

function lerp(a, b, t)
{
	return (1 - t) * a + b * t;
}

function dot(x1, y1, x2, y2)
{
	return x1 * x2 + y1 * y2;
}

function noise2D(x, z)
{ 
	// return Math.random();
	// n = x + z * 57;
//    n = (n << 13) ^ n;
//    var result = ( 1.0 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
//    document.write(result);
//    document.write("\n");
//    document.write("\n");
//    return result;
	
 	var noise = Math.sin(dot(x, z, 12.9898, 78.233)) * 43758.5453;
 	var whole = Math.floor(noise);

 	return noise - whole;

 	// fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

function smoothNoise(x, y)
{
    var corners = ( noise2D(x-1, y-1) + noise2D(x+1, y-1) + noise2D(x-1, y+1) + noise2D(x+1, y+1) ) / 16.0;
    var sides   = ( noise2D(x-1, y) + noise2D(x+1, y) + noise2D(x, y-1) + noise2D(x, y+1) ) /  8.0;
    var center  =  noise2D(x, y) / 4.0;
    return corners + sides + center;
}

function interpolatedNoise(x, y)
{

      var integer_X    = Math.floor(x);
      var fractional_X = x - integer_X;

      var integer_Y    = Math.floor(y);
      var fractional_Y = y - integer_Y;

      var v1 = smoothNoise(integer_X,     integer_Y)
      var v2 = smoothNoise(integer_X + 1, integer_Y)
      var v3 = smoothNoise(integer_X,     integer_Y + 1)
      var v4 = smoothNoise(integer_X + 1, integer_Y + 1)

      i1 = lerp(v1 , v2 , fractional_X)
      i2 = lerp(v3 , v4 , fractional_X)

      return lerp(i1 , i2 , fractional_Y)
}


function perlin2D(x, z, time)
{
	var total = 0;
	p = 0.3; // Persistence
	n = 5; // Octaves

	var tuningScalar = 0.5;

	var x2 = tuningScalar * (x + time);
	var z2 = tuningScalar * (z + time);

	var i;
	for(i = 0; i < n; i++)
	{
		var freq = Math.pow(2, i);
		var amp = Math.pow(p, i);

		total = total + (interpolatedNoise(x2 * freq, z2 * freq)) * amp;
	}

	return total;
}
