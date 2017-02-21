# HW 6: Ray marching and SDFs

## Goal
In this assignment, you will be implementing SDFs operators on various primitives and use a ray marcher to render them. Ray marching is a technique for rendering implicit surfaces where the ray-primitive intersection equation cannot be solved analytically. In contrast to marching cubes, ray marching can render beautiful images without explicit geometries, but is limited in simulating physical interaction such as collision that do require those geometries to exist (for example, bounding boxes, BVH, kd-tree).

**Warning**: this assignment diverge significantly from marching cubes, so switching options midway can be costly for  your time and effort.

## Base code framework

We have provided a preview scene, and a toggle for the ray marcher rendering. In WebGL, ray marching is done with fragment shader.

### Ray Marcher (25 pts)

The ray marcher should generate a ray direction, and march through the scene using the distances computed from sphere tracing.

**Note**: Your scene won't be rendered until you have implemented the SDFs for primitives below. 

- Generate Rays (15 pts): for each fragment inside the fragment shader, compute a ray direction for the ray marcher
- Sphere Tracing (10 pts): compute the nearest distance from the scene SDFs and update the ray marching's step size.

### SDF (50 pts)
##### Implement primitive SDFs (15pts):
These are simple primitives with well-defined SDFs. We encourage trying other SDFs not listed here, they are interesting! 
  - Sphere (3pts)
  - Box (3pts)
  - Cone (3pts)
  - Torus (3pts)
  - Cylinder (3pts)

##### Useful Operators (15pts)
To create constructive geometry, and interesting shapes (such as holes, bumps, etc.), implement the following operators to combine your primitive SDFs.
  - Intersection (2pts)
  - Subtraction (3pts)
  - Union (2pts)
  - Transformation (8pts)
    - translation and scaling
##### Compute normals based on gradient (15 pts)

Compute the normals to use for shading your surface.
- Read Chapter 13 of [Morgan McGuire's notes](http://graphics.cs.williams.edu/courses/cs371/f14/reading/implicit.pdf) 
##### Material (5pts)
Implement a simple Lambert material. Additional materials can earn extra points.

### Custom Scene (25 pts)
##### Create a mechanical device or a scene of your choice using all operators 
  - intersection, subtraction, union, transformation (20pts)
##### Animate the scene (5pts)

## Extra credits
- Implement SDF for [Mandelbulb](https://www.shadertoy.com/view/XsXXWS)
  - You need to implement naive raymarching (not sphere tracing) to get this to work 
- Lighting effects
  - Soft shadowing using secondary rays 
  - Ambient occlusion
- Additional materials besides Lambert.
- Additional SDFs besides the listed primitive.

## Resources
http://graphics.cs.williams.edu/courses/cs371/f14/reading/implicit.pdf

## Submission
- Update `README.md` to contain a solid description of your project
- Publish your project to gh-pages. `npm run deploy`. It should now be visible at http://username.github.io/repo-name
- Create a [pull request](https://help.github.com/articles/creating-a-pull-request/) to this repository, and in the comment, include a link to your published project.
- Submit the link to your pull request on Canvas.