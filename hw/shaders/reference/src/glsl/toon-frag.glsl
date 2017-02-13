
uniform sampler2D texture;
uniform int u_useTexture;
uniform vec3 u_albedo;
uniform vec3 u_ambient;
uniform vec3 u_lightPos;
uniform vec3 u_lightCol;
uniform float u_lightIntensity;
uniform int u_bins;
uniform vec3 u_cameraPos;
uniform int u_useOutline;
uniform float u_threshold;

varying vec3 f_position;
varying vec3 f_normal;
varying vec2 f_uv;

// http://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec4 color = vec4(u_albedo, 1.0);
    
    if (u_useTexture == 1) {
        color = texture2D(texture, f_uv);
    }

    float viewDot = clamp(dot(f_normal, normalize(u_cameraPos - f_position)), 0.0, 1.0);
    float d = clamp(dot(f_normal, normalize(u_lightPos - f_position)), 0.0, 1.0);

    vec3 rgb = d * color.rgb * u_lightCol * u_lightIntensity + u_ambient;
    vec3 hsv = rgb2hsv(rgb);
    hsv.y = floor(hsv.y * float(u_bins) + 0.5) / float(u_bins);
    hsv.z = floor(hsv.z * float(u_bins) + 0.5) / float(u_bins);
    vec3 binned = hsv2rgb(hsv);

    gl_FragColor = vec4(binned, 1.0);

    if (u_useOutline == 1 && viewDot < u_threshold) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}