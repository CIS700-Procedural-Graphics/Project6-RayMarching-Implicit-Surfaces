
export function None(renderer, scene, camera) {
    return {
        initGUI: function(gui) {

        },

        render: function() {
            renderer.render(scene, camera);
        }
    }
}

export {default as Grayscale} from './grayscale'
export {default as Bloom} from './bloom'
export {default as Warp} from './warp'