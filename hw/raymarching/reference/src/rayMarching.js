const THREE = require('three');
const EffectComposer = require('three-effectcomposer')(THREE)

export default function RayMarcher(renderer, scene, camera) {
    var composer = new EffectComposer(renderer);
    var shaderPass = new EffectComposer.ShaderPass({
        uniforms: {
            u_spheres: {
                type: '4fv',
                value: new Float32Array(100*4)
            },
            u_sphereCount: {
                type: 'i',
                value: 0
            },
            u_cameraPos: {
                type: 'v3',
                value: new THREE.Vector3()
            },
            u_invViewProj: {
                type: 'm4',
                value: new THREE.Matrix4()
            },
            u_near: {
                type: 'f',
                value: 0.1
            },
            u_far: {
                type: 'f',
                value: 2000
            }
        },
        vertexShader: require('./glsl/pass-vert.glsl'),
        fragmentShader: require('./glsl/rayMarch-frag.glsl')
    });
    shaderPass.renderToScreen = true;
    composer.addPass(shaderPass);

    var scratchMatrix = new THREE.Matrix4();

    return {
        render: function(sphereBuffer) {
            shaderPass.material.uniforms.u_spheres.value = sphereBuffer;
            shaderPass.material.uniforms.u_sphereCount.value = sphereBuffer.length / 4;

            camera.updateMatrixWorld(true);
            camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            camera.updateProjectionMatrix();
            scratchMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            
            shaderPass.material.uniforms.u_invViewProj.value.getInverse(scratchMatrix);
            shaderPass.material.uniforms.u_cameraPos.value.copy(camera.position);
            shaderPass.material.uniforms.u_near.value = camera.near;
            shaderPass.material.uniforms.u_far.value = camera.far;

            composer.render();
        }
    }
}