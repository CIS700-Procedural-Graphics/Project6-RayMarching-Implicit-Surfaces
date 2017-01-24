
export function cosineTaper(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;
    
    mesh.position.set(0, abs_y, 0);
    var amp = Math.abs(Math.cos(abs_y / 3)) + Math.abs(0.1*Math.cos(3*abs_y));
    var taper = (1 - rel_y);
    var scale = height / 2 * amp * taper;
    scale = Math.max(0.01, scale);
    mesh.scale.set(scale, settings.size, scale);
}

export function sawtooth(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;

    mesh.position.set(0, abs_y, 0);

    var period = 5;
    var t = 1 - (abs_y % period) / period;
    var decay = Math.pow(1 - abs_y / height, 3)
    var scale = t * height * decay;
    scale = Math.max(0.01, scale);
    mesh.scale.set(scale, settings.size, scale);
}

export function triangle(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;

    mesh.position.set(0, abs_y, 0);

    var period = 10;
    var t = 1 - (abs_y % period) / period;
    t = Math.pow(2 * Math.abs(t - 0.5) + 0.2, 3);
    var decay = Math.pow(1 - abs_y / height, 1)
    var scale = t * height / 2 * decay;
    scale = Math.max(0.01, scale);
    mesh.scale.set(scale, settings.size, scale);
}

export function step(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;

    mesh.position.set(0, abs_y, 0);

    var period = 10;
    var t = 1 - (abs_y % period) / period;

    var period = 4;
    var decay = Math.cos(rel_y * 3 * Math.PI / 4 - Math.PI / 4);
    var step = Math.floor((height - abs_y) / period);
    step /= (height / period);
    var scale = height * decay * step;
    scale = Math.max(0.01, scale);
    mesh.scale.set(scale, settings.size, scale);
}