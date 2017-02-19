
uniform sampler2D tDiffuse;
uniform sampler2D t2;
varying vec2 f_uv;

void main() {
    gl_FragColor = texture2D(tDiffuse, f_uv) + texture2D(t2, f_uv);
}   