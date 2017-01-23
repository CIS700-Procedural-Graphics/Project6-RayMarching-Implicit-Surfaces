
export function cosineTaper(mesh, settings) {
    var abs_y = settings.pos;
    var height = settings.max - settings.min;
    var rel_y = (settings.pos - settings.min) / height;

    mesh.position.set(0, abs_y, 0);
    var amp = Math.cos(abs_y);
    amp = Math.abs(amp);
    amp = Math.max(0.1, amp);
    var taper = (1 - rel_y);
    var scale = height / 2 * amp * taper;
    mesh.scale.set(scale, settings.size, scale);
}