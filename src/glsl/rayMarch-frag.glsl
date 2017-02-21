
#define MAX_GEOMETRY_COUNT 100

/* This is how I'm packing the data
struct geometry_t {
    vec3 position;
    float type;
};
*/
uniform vec4 u_buffer[MAX_GEOMETRY_COUNT];
uniform int u_count;

varying vec2 f_uv;

void main() {
    float t;
    for (int i = 0; i < MAX_GEOMETRY_COUNT; ++i) {
        if (i >= u_count) {
            break;
        }
    }

    gl_FragColor = vec4(f_uv, 0, 1);
}