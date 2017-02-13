
const THREE = require('three');
import {textureLoaded} from '../mario'

var options = {
    lightColor: '#ffffff',
    lightIntensity: 2,
    albedo: '#dddddd',
    ambient: '#111111',
    useTexture: true,
    bins: 2,
    useOutline: true,
    threshold: 0.4
}

export default function(renderer, scene, camera) {

    const Shader = {
        initGUI: function(gui) {
            gui.addColor(options, 'lightColor').onChange(function(val) {
                Shader.material.uniforms.u_lightCol.value = new THREE.Color(val);
            });
            gui.add(options, 'lightIntensity').onChange(function(val) {
                Shader.material.uniforms.u_lightIntensity.value = val;
            });
            gui.addColor(options, 'albedo').onChange(function(val) {
                Shader.material.uniforms.u_albedo.value = new THREE.Color(val);
            });
            gui.addColor(options, 'ambient').onChange(function(val) {
                Shader.material.uniforms.u_ambient.value = new THREE.Color(val);
            });
            gui.add(options, 'useTexture').onChange(function(val) {
                Shader.material.uniforms.u_useTexture.value = val;
            });
            gui.add(options, 'bins').onChange(function(val) {
                Shader.material.uniforms.u_bins.value = val;
            });
            gui.add(options, 'useOutline').onChange(function(val) {
                Shader.material.uniforms.u_useOutline.value = val;
            })
            gui.add(options, 'threshold', 0, 1).onChange(function(val) {
                Shader.material.uniforms.u_threshold.value = val;
            })
        },
        
        material: new THREE.ShaderMaterial({
            uniforms: {
                texture: {
                    type: "t", 
                    value: null
                },
                u_useTexture: {
                    type: 'i',
                    value: options.useTexture
                },
                u_albedo: {
                    type: 'v3',
                    value: new THREE.Color(options.albedo)
                },
                u_ambient: {
                    type: 'v3',
                    value: new THREE.Color(options.ambient)
                },
                u_lightPos: {
                    type: 'v3',
                    value: new THREE.Vector3(30, 50, 40)
                },
                u_lightCol: {
                    type: 'v3',
                    value: new THREE.Color(options.lightColor)
                },
                u_lightIntensity: {
                    type: 'f',
                    value: options.lightIntensity
                },
                u_bins: {
                    type: 'i',
                    value: options.bins
                },
                u_useOutline: {
                    type: 'i',
                    value: options.useOutline
                },
                u_threshold: {
                    type: 'f',
                    value: options.threshold
                },
                u_cameraPos: {
                    type: 'v3',
                    value: camera.position
                }
            },
            vertexShader: require('../glsl/lambert-vert.glsl'),
            fragmentShader: require('../glsl/toon-frag.glsl')
        })
    }

    textureLoaded.then(function(texture) {
        Shader.material.uniforms.texture.value = texture;
    });

    return Shader;
}