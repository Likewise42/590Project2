'use strict';

var body = void 0;
var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var hash = void 0;
var currentScene = "title";
var drawList = {};

var init = function init() {
  body = document.querySelector('body');
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  body.onmousemove = onMouseMove;

  canvas.onclick = onCanvasClick;

  drawList.leftPaddle = new Paddle(canvas.width / 10, canvas.height / 2);
  drawList.rightPaddle = new Paddle(canvas.width / 10 * 9, canvas.height / 2);

  window.requestAnimationFrame(update);
};
window.onload = init;

var onMouseMove = function onMouseMove(e) {
  //console.log(e.offsetY);

  drawList.leftPaddle.y = e.offsetY;
  if (drawList.leftPaddle.y > 500) {
    drawList.leftPaddle.y = 500;
  } else if (drawList.leftPaddle.y < 0) {
    drawList.leftPaddle.y = 0;
  }
};

var onCanvasClick = function onCanvasClick(e) {
  ctx.save();
  //console.dir(e);

  //use offsetX and offsetY
  //  ctx.fillStyle = "red";
  //  ctx.fillRect(e.offsetX,e.offsetY,20,20);


  if (currentScene === "title") {
    currentScene = "gameplay";
  }

  ctx.restore();
};

var draw = function draw() {
  ctx.save();
  var keys = Object.keys(drawList);

  for (var i = 0; i < keys.length; i++) {
    var toDraw = drawList[keys[i]];

    toDraw.drawThis();
  }

  ctx.restore();
};

var titleScreen = function titleScreen() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Pong!", canvas.width / 2, canvas.height / 2);
  ctx.fillText("Click to start", canvas.width / 2, canvas.height / 2 + canvas.height / 10);

  ctx.restore();
};

var gameplay = function gameplay() {
  ctx.save();

  draw();

  ctx.restore();
};

var update = function update() {

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (currentScene === "title") {
    titleScreen();
  } else if (currentScene === "gameplay") {
    gameplay();
  }

  requestAnimationFrame(update);
};
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Paddle = function () {
  function Paddle(xPos, yPos) {
    _classCallCheck(this, Paddle);

    this.x = xPos;
    this.y = yPos;

    this.width = canvas.width / 20;
    this.height = canvas.height / 4;
  }

  _createClass(Paddle, [{
    key: "drawThis",
    value: function drawThis() {
      ctx.save();

      ctx.fillStyle = "white";
      var drawX = this.x - this.width / 2;
      var drawY = this.y - this.height / 2;
      ctx.fillRect(drawX, drawY, this.width, this.height);

      ctx.restore();
    }
  }]);

  return Paddle;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Puck = function () {
  function Puck(xPos, yPos) {
    _classCallCheck(this, Puck);

    this.x = xPos;
    this.y = yPos;

    this.velocityX;
    this.velocityY;

    this.velocityMult = 1;
  }

  _createClass(Puck, [{
    key: "increaseVelocityMult",
    value: function increaseVelocityMult() {
      this.velocityMult += .1;
    }
  }]);

  return Puck;
}();
