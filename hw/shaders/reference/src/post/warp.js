const THREE = require('three');
const EffectComposer = require('three-effectcomposer')(THREE)

var options = {
    amplitude: 20,
    period: 10   
}

var WarpShader = new EffectComposer.ShaderPass({
    uniforms: {
        tDiffuse: {
            type: 't',
            value: null
        },
        u_resolution: {
            type: 'v2',
            value: new THREE.Vector2(1, 1)
        },
        u_amplitude: {
            type: 'f',
            value: options.amplitude
        },
        u_period: {
            type: 'f',
            value: options.period
        },
        u_t: {
            type: 'f',
            value: (new Date()).valueOf()
        }
    },
    vertexShader: require('../glsl/pass-vert.glsl'),
    fragmentShader: require('../glsl/warp-frag.glsl')
});

function setResolution() {
    WarpShader.material.uniforms.u_resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', setResolution);
window.addEventListener('load', setResolution);


export default function Warp(renderer, scene, camera) {
    var composer = new EffectComposer(renderer);
    composer.addPass(new EffectComposer.RenderPass(scene, camera));

    WarpShader.renderToScreen = true;
    composer.addPass(WarpShader)

    var start = (new Date()).valueOf();

    return {
        initGUI: function(gui) {
            gui.add(options, 'amplitude').onChange(function(val) {
                WarpShader.material.uniforms.u_amplitude.value = val;
            });

            gui.add(options, 'period').onChange(function(val) {
                WarpShader.material.uniforms.u_period.value = val;
            });
        },

        render: function() {
            WarpShader.material.uniforms.u_t.value = ((new Date()).valueOf() - start) / 10000.0;
            composer.render();
        }
    }
}