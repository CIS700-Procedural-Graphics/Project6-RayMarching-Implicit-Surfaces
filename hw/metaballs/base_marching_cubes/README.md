# Project 6: Implicit surfaces - Marching cubes

**Goal:** Generate metaballs using density functions with marching cubes algorithm. See [link]() for the ray marching version of this assignment.

![](ref_metaballs.gif)

With matching cubes, the high level idea is to voxelize space, then generate triangles for each voxel from a set of predetermined configurations based on the density function of the metaballs.

We suggest the following resources:

[Generating complex terrain](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch01.html) from [GPU Gems 3](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_pref01.html).
[Polygonising a scalar field](http://paulbourke.net/geometry/polygonise/) by Paul Bourke.
[Marching squares](Metaball and Marching Squares) by Jamie Wong.

## Moving metaballs (5 points)

The `Metaball` class defines the position, velocity, and radius of a metaball. Implement its `update` function to start moving them around. Make sure to handle boundaries such that the balls will not reach close the grid's edges. This could interfere with polygonization later on. We suggest keeping a margin.

## Sampling at corners (5 points)

Modify the `update` function from `MarchingCubes` class to start sampling from the corners of each voxels, instead of sampling from the center points.

## Polygonization (50 points)

Implement `polygonize` inside `Cell` class. This function should return the list of vertices and normals of the triangles generated from the voxel. The table assumes the following voxel's indexing scheme:

![](./ref_voxel_indexing.png)

Using 8-bit, each corner that has an isovalue above the isolevel can be represented as a 1. 

### Vertices
To compute the vertices, we have provided the look-up tables from Paul Bourke's.

- **EDGE_TABLE**: This table returns a 12-bit index that represents the edges intersected by the isosurface. An edge is intersected if its bit is 1. For each intersected edge, compute the linearly interpolated vertex position on the edge according to the isovalue at each end corner of the edge.

- **TRI_TABLE**: This table acts as the triangle indices. Every 16 elements in the table represents a possible polygonizing configuration. Within each configuration, every three consecutive elements represents the indices of a triangle that should be created from the edges above. 

### Normals

The normal at each vertex position can be computed by using the partial derivative, or gradient, of the density function, with respect to the x, y, and z dimension.

## Meshing (20 points)

Now that you have obtained a list of 'vertices' and 'normals' from each voxel, implement `makeMesh` and `updateMesh` from `MarchingCubes` class to generate the mesh once and update its geometry each frame.

## Materials (10 points)

Interesting shader materials beyond just the provided threejs materials.

## Other types of implicit surfaces or creativity (10 points)

The density function isn't restricted to just metaball. Implement other none-spherical surfaces (for example: planes, mesh, etc.). Implement a GUI dropdown for switching between metaballs and your added implicit surfaces.

Alternatively, you can invest in making a more interesting scene with your existing metaballs.

## Debugging

The base code provides a rudimentary grid, some moving spheres, and each voxel displays its density value at the center.

**Note**: The visual debugging can be helpful while developing your codes at lower resolution, but it is memory intensive. We highly recommend removing it after you finished your implementation.

## Suggestions

Your final grid's cell width should be around 0.3 to make it look smooth.



