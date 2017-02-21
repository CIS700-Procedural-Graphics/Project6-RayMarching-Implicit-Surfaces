# Project 6: Implicit surfaces - Marching cubes

**Goal:** Implement an isosurface created from metaballs using the marching cubes algorithm. 

Metaballs are organic-looking n-dimensional objects. We will be implementing a 3-dimensional metaballs. They are great to make bloppy shapes. An isosurface is created whenever the metaball function crosses a certain threshold, called isolevel. The metaball function describes the total influences of each metaball to a given points as a function between its radius and distance to the point:

`(radius * radius) / (distance * distance)`

By summing up all these influences, you effectively describes all the points that are greater than the isolevel as inside, and less than the isolevel as outside (or vice versa). As an observation, the bigger the metaball's radius is, the bigger its influence is.

Marching cubes can achieve a similar effect to ray marching for rendering implicit surfaces, but in addition to the rendered image, you also retain actual geometries. Marching cubes are commonly used in MRI scanning, where you can generate geometries for the scans. Marching cubes are also used to generate complex terrains with caves in games. The additional geometry information can handily support collision and other physical calculation for game engines. For example, their bounding boxes can then be computed to construct the acceleration data structure for collisions.

**Warning**: this assignment option requires more effort than the ray marching option. The two base codes diverge significantly, so switching options midway can be costly for  your time and effort.

## Resources
We suggest reading the following resources before starting your assignment:

- [Generating complex terrain](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch01.html) from [GPU Gems 3](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_pref01.html).
- [Polygonising a scalar field](http://paulbourke.net/geometry/polygonise/) by Paul Bourke.
- [Marching squares](http://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/) by Jamie Wong.

## Base code framework

We have provided a basecode as a reference. You are welcome to modify the framework for your project. The basecode implements metaballs on the CPU.

_main.js_:

  - `App`:

This is a global configuration object. All information for the marching cubes are stored here. 

**Note**: `App.visualDebug` is a global control of all the visual debugging components. Even though it is helpful for development, it could be memory intensive. Toggle this flag off for better perforamance at high resolution.

_marching_cubes.js_:

  - `class MarchingCubes`:
    This class encapsulates everything about the metaballs, grid, voxels, and sampling information.

  - `class Voxel`:
    This class contains information about a single voxel, and its sample points. Polygonization happens here.

_inspect_point.js_:

  - `class InspectPoint`:
    This class simply contains a single sample point that can output its value on the screen at its pixel location.

_metaball.js_:

  - `class Metaball`:
    This class represents a single metaball.

_marching_cube_LUT.js_:

This file contains the edge table and the triangle table for the marching cubes.

## Moving metaballs (5 points)
The `Metaball` class defines the position, velocity, and radius of a metaball. Implement its `update` function to start moving them around. Make sure to handle boundaries such that the balls will not reach close the grid's edges. This could interfere with polygonization later on. We suggest keeping a margin.

## Sampling at corners (15 points)
At each frame update, compute the sample values for all corners of a voxel.

## Polygonization (50 points)
Implement `polygonize` inside `Cell` class. This function should return the list of vertices and normals of the triangles generated from the voxel. The table assumes the following voxel's indexing scheme:

![](./ref_voxel_indexing.png)

- _The eight corners can be represented as an 8-bit number, where 1 means the isovalue is above or below the isolevel based on your implementation._
- _The twelve edges can be represented as a 12-bit number, where 1 means that the isosurface intersects with this edge._

### Vertices (30 points out of 50)
To compute the vertices, we have provided the look-up tables from Paul Bourke's.

- **EDGE_TABLE**: This table returns a 12-bit index that represents the edges intersected by the isosurface. An edge is intersected if its bit is 1. For each intersected edge, compute the linearly interpolated vertex position on the edge according to the isovalue at each end corner of the edge.

- **TRI_TABLE**: This table acts as the triangle indices. Every 16 elements in the table represents a possible polygonizing configuration. Within each configuration, every three consecutive elements represents the indices of a triangle that should be created from the edges above. 

### Normals (20 points out of 50)
Compute the normals using the gradient of the vertex with respect to the x, y, and z.

## Meshing (20 points)
The mesh for the isosurface should be created once. At each frame, using the list of **vertices** and **normals** polygonized from the voxels, update the mesh's geometry for the isosurface. Notice that the total volume of the mesh does change.

## Materials and post-processing (10 points)
Interesting shader materials beyond just the provided threejs materials. We encourage using your previous shaders assignment for this part.

## Extra credits
- Metaball can be positive or negative. A negative metaball will substract from the surface (which pushed the surface inward). Implement a scene with both positive and negative metaballs.
- More implicit surfaces! Implement other none-spherical surfaces (for example: planes, mesh, etc.). Some very interesting ideas are to blend your metaballs into those surfaces.

## Submission

- Update `README.md` to contain a solid description of your project
- Publish your project to gh-pages. `npm run deploy`. It should now be visible at http://username.github.io/repo-name
- Create a [pull request](https://help.github.com/articles/creating-a-pull-request/) to this repository, and in the comment, include a link to your published project.
- Submit the link to your pull request on Canvas.

