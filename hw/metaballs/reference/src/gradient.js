const THREE = require('three');

export function generateGradientTexture() {

  var canvas;
  var size = 512;

  // create canvas
  canvas = document.createElement( 'canvas' );
  canvas.width = size;
  canvas.height = size;

  // get context
  var context = canvas.getContext( '2d' );

  // draw gradient
  context.rect( 0, 0, size, size );
  var gradient = context.createLinearGradient( 0, 0, 0, size );
  gradient.addColorStop(0, '#00ceaf'); 
  gradient.addColorStop(0.7, '#002234');
  gradient.addColorStop(1, 'transparent'); 
  context.fillStyle = gradient;
  context.fill();

  return new THREE.CanvasTexture(canvas);;

}