let canvas;
let ctx;
let socket;
let hash;

const init = () => {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  window.requestAnimationFrame(update);
}

window.onload = init;