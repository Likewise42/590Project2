'use strict';

var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var hash = void 0;

var init = function init() {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  window.requestAnimationFrame(update);
};

window.onload = init;
