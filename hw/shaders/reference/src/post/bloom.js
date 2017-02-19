const THREE = require('three');
const EffectComposer = require('three-effectcomposer')(THREE)

var options = {
    threshold: 0.95,
    pixels: 2,
    iterations: 10
}

var HighpassShader = new EffectComposer.ShaderPass({
    uniforms: {
        tDiffuse: {
            type: 't',
            value: null
        },
        u_threshold: {
            type: 'f',
            value: options.threshold
        }
    },
    vertexShader: require('../glsl/pass-vert.glsl'),
    fragmentShader: require('../glsl/highpass-frag.glsl')
});

var BlurXShader = new EffectComposer.ShaderPass({
    uniforms: {
        tDiffuse: {
            type: 't',
            value: null
        },
        u_resolution: {
            type: 'v2',
            value: new THREE.Vector2(1, 1)
        },
        u_dir: {
            type: 'v2',
            value: new THREE.Vector2(1, 0)
        },
        u_amount: {
            type: 'f',
            value: options.pixels
        }
    },
    vertexShader: require('../glsl/pass-vert.glsl'),
    fragmentShader: require('../glsl/blur-frag.glsl')
});

var BlurYShader = new EffectComposer.ShaderPass({
    uniforms: {
        tDiffuse: {
            type: 't',
            value: null
        },
        u_resolution: {
            type: 'v2',
            value: new THREE.Vector2(1, 1)
        },
        u_dir: {
            type: 'v2',
            value: new THREE.Vector2(0, 1)
        },
        u_amount: {
            type: 'f',
            value: options.pixels
        }
    },
    vertexShader: require('../glsl/pass-vert.glsl'),
    fragmentShader: require('../glsl/blur-frag.glsl')
});

var AddShader = new EffectComposer.ShaderPass({
    uniforms: {
        tDiffuse: {
            type: 't',
            value: null
        },
        t2: {
            type: 't',
            value: null
        }
    },
    vertexShader: require('../glsl/pass-vert.glsl'),
    fragmentShader: require('../glsl/add-frag.glsl')
});

function setResolution() {
    BlurXShader.material.uniforms.u_resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
    BlurYShader.material.uniforms.u_resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', setResolution);
window.addEventListener('load', setResolution);

export default function Bloom(renderer, scene, camera) {

    var composer;
    var composer2 = new EffectComposer(renderer);
    composer2.addPass(new EffectComposer.RenderPass(scene, camera));

    AddShader.material.uniforms.t2.value = composer2.readBuffer.texture;
    AddShader.renderToScreen = true;

    function createComposer() {
        composer = new EffectComposer(renderer);
        composer.addPass(new EffectComposer.RenderPass(scene, camera, null, new THREE.Color(0x000000, 0)));
        composer.addPass(HighpassShader);
        for (let i = 0; i < options.iterations; ++i) {
            composer.addPass(BlurXShader);
            composer.addPass(BlurYShader);
        }
        composer.addPass(AddShader);
    }

    createComposer();

    return {
        initGUI: function(gui) {
            gui.add(options, 'threshold', 0, 1).onChange(function(val) {
                HighpassShader.material.uniforms.u_threshold.value = val;
            });

            gui.add(options, 'pixels').onChange(function(val) {
                BlurXShader.material.uniforms.u_amount.value = val;
                BlurYShader.material.uniforms.u_amount.value = val;
            })

            gui.add(options, 'iterations').onChange(function(val) {
                createComposer();
            });
        },
        
        render: function() {
            composer2.render();
            composer.render();
        }
    }
}