
uniform sampler2D tDiffuse;
varying vec2 f_uv;
uniform float u_threshold;

void main() {
    vec4 col = texture2D(tDiffuse, f_uv);
    
    if (length(col.rgb) < u_threshold) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
        gl_FragColor = col;
    }
}   