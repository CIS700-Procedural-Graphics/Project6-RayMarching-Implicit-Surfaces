
uniform sampler2D texture;
uniform int u_useTexture;
uniform vec3 u_albedo;
uniform vec3 u_ambient;
uniform vec3 u_lightPos;
uniform vec3 u_lightCol;
uniform float u_lightIntensity;
uniform vec3 u_cameraPos;

varying vec3 f_position;
varying vec3 f_normal;
varying vec2 f_uv;

void main() {
    vec4 color = vec4(u_albedo, 1.0);
    
    if (u_useTexture == 1) {
        color = texture2D(texture, f_uv);
    }

    float t = clamp(dot(f_normal, normalize(u_cameraPos - f_position)), 0.0, 1.0);
    float dotproduct = clamp(dot(f_normal, normalize(u_lightPos - f_position)), 0.0, 1.0);

    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);

    vec3 rainbow = a + b * cos(2.0*3.14159265 * (c * t + d));
    
    gl_FragColor = vec4(dotproduct * rainbow.rgb * u_lightCol * u_lightIntensity + u_ambient, 1.0);
}