import * as Shaders from './shaders'
import * as Post from './post'
import DAT from 'dat-gui'

DAT.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}

DAT.GUI.prototype.emptyFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  for (let i = 0; i < folder.__controllers.length; ++i) {
      folder.__controllers[i].remove();
  }
  folder.__controllers.length = 0;
  this.onResize();
}

export function setupGUI(shaderSet, postProcessSet) {
    var gui = new DAT.GUI();
    var opts = { shader: null, post: null }

    var shaderControl = gui.add(opts, 'shader', Object.keys(Shaders)).onChange(name => {
        setShader(name);
    });
    var shaderFolder = gui.addFolder('Shader Settings');
    shaderFolder.open();

    var postControl = gui.add(opts, 'post', Object.keys(Post)).onChange(name => {
        setPostProcess(name);
    })
    var postFolder = gui.addFolder('Post Process Settings');
    postFolder.open();

    function setShader(name) {
        gui.emptyFolder('Shader Settings');
        opts.shader = name;
        shaderControl.updateDisplay();
        shaderSet(Shaders[name], shaderFolder);
    }

    function setPostProcess(name) {
        gui.emptyFolder('Post Process Settings');
        opts.post = name;
        postControl.updateDisplay();
        postProcessSet(Post[name], postFolder);
    }

    setShader(Object.keys(Shaders)[0]);
    setPostProcess(Object.keys(Post)[3]);

    return {
        setShader,
        setPostProcess
    }
}