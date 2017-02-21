const THREE = require('three');

var proxyMaterial = new THREE.MeshLambertMaterial({
    color: 0xff0000
});

const SPHERE_RESOLUTION = 32;

export default class ProxySpheres {
    constructor(bounds) {
        this.group = new THREE.Group();
        this.bounds = bounds.clone();
        this._buffer = undefined;
    }

    addSphere(radius) {
        var geo = new THREE.SphereGeometry(radius, SPHERE_RESOLUTION, SPHERE_RESOLUTION);
        var sphere = new THREE.Mesh(geo, proxyMaterial);
        sphere.velocity = new THREE.Vector3(
            5 * (Math.random() - 0.5), 
            5 * (Math.random() - 0.5), 
            5 * (Math.random() - 0.5)
        );
        this.group.add(sphere);

        sphere.position.set(
            (Math.random() - 0.5) * this.bounds.x,
            (Math.random() - 0.5) * this.bounds.y,
            (Math.random() - 0.5) * this.bounds.z
        );
        this._buffer = new Float32Array(this.group.children.length * 4);
    }

    addSpheres(sphereRadii) {
        for (let i = 0; i < sphereRadii.length; ++i) {
            this.addSphere(sphereRadii[i]);
        }
    }

    removeSphere(sphere) {
        this.group.remove(sphere);
        this._buffer = new Float32Array(this.group.children.length * 4);
    }

    clear() {
        while(this.group.children.length) {
            this.group.remove(this.group.children[i]);
        }
        this._buffer = new Float32Array(this.group.children.length * 4);
    }

    update(t = 1/60) {
        const {children} = this.group;
        for (let i = 0; i < children.length; ++i) {
            const sphere = children[i];
            sphere.position.addScaledVector(sphere.velocity, t);
            if (Math.abs(sphere.position.x) >= this.bounds.x / 2) sphere.velocity.x *= -1;
            if (Math.abs(sphere.position.y) >= this.bounds.y / 2) sphere.velocity.y *= -1;
            if (Math.abs(sphere.position.z) >= this.bounds.z / 2) sphere.velocity.z *= -1;
        }
        this.computeBuffer();
    }

    computeBuffer() {
        const {children} = this.group;
        for (let i = 0; i < children.length; ++i) {
            const sphere = children[i];
            this._buffer[4*i] = sphere.position.x;
            this._buffer[4*i+1] = sphere.position.y;
            this._buffer[4*i+2] = sphere.position.z; 
            this._buffer[4*i+3] = sphere.geometry.parameters.radius;
        }
    }

    get buffer() {
        return buf;
        // return this._buffer;
    }
}

var buf = new Float32Array([0,0,0,3, 5,0,0,3]);