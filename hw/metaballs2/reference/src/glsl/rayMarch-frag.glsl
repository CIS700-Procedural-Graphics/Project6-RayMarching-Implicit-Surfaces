
#define MAX_ITERATIONS 40
#define MAX_SPHERES 15
#define THRESHOLD 0.6
#define EPSILON 0.0001

uniform vec4 u_spheres[MAX_SPHERES];
uniform int u_sphereCount;
uniform mat4 u_invViewProj;
uniform vec3 u_cameraPos;
uniform float u_near;
uniform float u_far;
varying vec2 f_uv;

const float R_FACTOR = 1.0;// / THRESHOLD;

vec2 intersectSphere(vec3 ro, vec3 rd, vec4 sphere) {
    vec3 vec = ro - sphere.xyz;
    float A = dot(rd, rd);
    float B = 2.0 * dot(rd, vec);
    float C = dot(vec, vec) - sphere[3] * sphere[3];

    float det = B*B - 4.0*A*C;
    if (det < 0.0) {
        return vec2(-1, -1);
    }
    float detRt = sqrt(det);
    float t0 = (-B - det) / (2.0*A);
    float t1 = (-B + det) / (2.0*A);

    if (t0 < t1) {
        return vec2(t0, t1);
    } else {
        return vec2(t1, t0);
    }
}

void main() {
    gl_FragColor = vec4(f_uv, 0, 1);
    return;
    vec2 ndc = 2.0 * (f_uv - 0.5);

    vec4 p = u_invViewProj * vec4(ndc, 1.0, 1.0) * u_far;
    
    vec3 ro = u_cameraPos;
    vec3 rd = normalize(p.xyz - ro);

    float near = u_far;
    float far = u_near;

    float distances[MAX_SPHERES];
    float inverseRadii[MAX_SPHERES];
    vec3 normals[MAX_SPHERES];

    for (int i = 0; i < MAX_SPHERES; ++i) {
        if (i >= u_sphereCount) break;

        vec2 ts = intersectSphere(ro, rd, u_spheres[i]);

        if (ts[0] >= 0.0 && ts[0] < near) {
            near = ts[0];
        }

        if (ts[1] >= 0.0 && ts[1] > far) {
            far = ts[1];
        }

        // float rad = u_spheres[i].w;
        // inverseRadii[i] = 1.0 / rad;
        // distances[i] = ts[0];

        
        vec3 vec = u_spheres[i].xyz - ro;
        float r = length(vec);
        distances[i] = r;
        float rad = u_spheres[i].w * R_FACTOR;
        
        inverseRadii[i] = 1.0 / rad;

        // if (r + rad > far) {
        //     far = r + rad;
        // }
        // if (r - rad < near) {
        //     near = r - rad;
        // }
    }

    if (near > far) {
        discard;
        return;
    }
    

    // if (near < 0.0) {
    //     near = 0.0;
    // }
    // near *= 0.5;
    // near = u_near;
    // far = u_far;

    float depth = near;
    float step = 0.1;
    for (int i = 0; i < MAX_ITERATIONS; ++i) {

        float sdf = 0.0;

        for (int j = 0; j < MAX_SPHERES; ++j) {
            if (j >= u_sphereCount) break;
            
            vec3 p = ro + rd * depth;
            vec3 vec = p - u_spheres[j].xyz;
            float l = length(vec);
            float r = l * inverseRadii[j];
            normals[j] = vec / l;

            if (r > 1.0) continue;
            float d = r * r * r * (r * (r * 6.0 - 15.0) + 10.0);
            // float oneMinusR2 = (1.0 - r * r);
            // float d = oneMinusR2 * oneMinusR2;

            sdf += d;
        }

        if (abs(sdf - THRESHOLD) < EPSILON) {
            break;
        }

        if (sdf > THRESHOLD) {
            step *= 0.5;
            depth -= step;
            continue;
        }

        depth += step;

        if (depth >= far) {
            depth = far;
            discard;
            break;
        }
    }

    vec3 normal = vec3(0);
    for (int i = 0; i < MAX_SPHERES; ++i) {
        if (i >= u_sphereCount) break;
        if (distances[i] > 0.0) {
            normal += (1.0 / distances[i]) * normals[i];
        }
    }
    normal = normalize(normal);


    // gl_FragColor = vec4(vec3(depth / far), 1.0);
    // gl_FragColor = vec4(normal, 1.0);
    float lightingTerm = max(dot(normal, vec3(0, 1, 0)), 0.0);
    gl_FragColor = vec4(vec3(lightingTerm), 1.0);

    
    /*float t = -1.0;
    vec3 nor = vec3(0.0);
    for (int i = 0; i < 100; ++i) {
        if (i >= u_sphereCount) break;

        vec3 vec = ro - u_spheres[i].xyz;
        float A = dot(rd, rd);
        float B = 2.0 * dot(rd, vec);
        float C = dot(vec, vec) - u_spheres[i][3] * u_spheres[i][3];

        float det = sqrt(B*B - 4.0*A*C);
        float t0 = (-B - det) / (2.0*A);
        
        if (t0 > 0.0) {
            if (t0 < t || t < 0.0) {
                t = t0;

                nor = normalize(ro + t * rd - u_spheres[i].xyz);
            }
            continue;
        }

        float t1 = (-B + det) / (2.0*A);
        if (t1 > 0.0 && (t1 < t || t < 0.0)) {
            t = t1;

            nor = normalize(ro + t * rd - u_spheres[i].xyz);
        }
    }*/

    // gl_FragColor = vec4(vec3(t / 100.0), 1);
    // gl_FragColor = vec4(abs(rd), 1);
    // gl_FragColor = vec4(f_uv, 0, 1);
    // gl_FragColor = vec4(nor, 1);

    /*if (t < 0.0) {
        discard;
    }*/
}