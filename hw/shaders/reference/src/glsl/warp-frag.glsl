
uniform sampler2D tDiffuse;
varying vec2 f_uv;
uniform vec2 u_resolution;
uniform float u_amplitude;
uniform float u_period;
uniform float u_t;

//  <https://www.shadertoy.com/view/4dS3Wd>
//  By Morgan McGuire @morgan3d, http://graphicscodex.com
//
float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}

float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);

    // Four corners in 2D of a tile
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    // Simple 2D lerp using smoothstep envelope between the values.
    // return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
    //          mix(c, d, smoothstep(0.0, 1.0, f.x)),
    //          smoothstep(0.0, 1.0, f.y)));

    // Same code, with the clamps in smoothstep and common subexpressions
    // optimized away.
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// float noise2(vec2 x) {
//     vec2 i = floor(x);
//     vec2 f = fract(x);

//     // Four corners in 2D of a tile
//     float a = rand(i);
//     float b = rand(i + vec2(1.0, 0.0));
//     float c = rand(i + vec2(0.0, 1.0));
//     float d = rand(i + vec2(1.0, 1.0));

//     // Simple 2D lerp using smoothstep envelope between the values.
//     // return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
//     //          mix(c, d, smoothstep(0.0, 1.0, f.x)),
//     //          smoothstep(0.0, 1.0, f.y)));

//     // Same code, with the clamps in smoothstep and common subexpressions
//     // optimized away.
//     vec2 u = f * f * (3.0 - 2.0 * f);
//     return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
// }


float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float smoothnoise(vec3 x) {
    // vec3 i = floor(x);
    // vec3 f = fract(x);
    // ^ should probably use this to blend properly

    float a = noise(x + vec3(0.0, 0.0, 0.0));
    float b = noise(x + vec3(1.0, 0.0, 0.0));
    float c = noise(x + vec3(0.0, 1.0, 0.0));
    float d = noise(x + vec3(1.0, 1.0, 0.0));
    float e = noise(x + vec3(0.0, 0.0, 1.0));
    float f = noise(x + vec3(1.0, 0.0, 1.0));
    float g = noise(x + vec3(0.0, 1.0, 1.0));
    float h = noise(x + vec3(1.0, 1.0, 1.0));

    return (a + b + c + d + e + f + g + h) / 8.0;
}

vec2 distort(vec2 uv) {
    vec2 offset = vec2(
        smoothnoise(vec3(uv, u_t) * u_resolution.x / u_period),
        smoothnoise(vec3(uv + 1345.0, u_t) * u_resolution.y / u_period)
    );

    return uv + u_amplitude * (offset - 0.5) / u_resolution;
}

void main() {
    gl_FragColor = texture2D(tDiffuse, distort(f_uv));   
}