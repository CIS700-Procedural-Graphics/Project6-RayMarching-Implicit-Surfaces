
export function func1(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;
    
    mesh.position.set(0, abs_y, 0);
}

export function sawtooth(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;
    
    mesh.position.set(0, abs_y, 0);
}

export function triangle(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;
    
    mesh.position.set(0, abs_y, 0);
}

export function step(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;
    
    mesh.position.set(0, abs_y, 0);
}