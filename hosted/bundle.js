'use strict';

var body = void 0;
var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var hash = void 0;
var currentScene = "gameplay";
var drawList = {};

var init = function init() {
  //socket stuff
  socket = io.connect();

  socket.on('connect', function () {
    console.log('connected to the server');

    document.querySelector("#usernameButton").onclick = joinButton;

    socket.on('nameValid', function (data) {
      document.querySelector("#usernameRow").style.display = "none";
      document.querySelector("#nameAlert").style.display = "none";
      document.querySelector("#joinHostRow").style.display = "block";
    });

    socket.on('nameInvalid', function (data) {
      document.querySelector("#nameAlert").style.display = "block";
    });
  });

  body = document.querySelector('body');
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  body.onmousemove = onMouseMove;

  //  canvas.onclick = onCanvasClick;

  drawList.leftPaddle = new Paddle(canvas.width / 10, canvas.height / 2);
  drawList.rightPaddle = new Paddle(canvas.width / 10 * 9, canvas.height / 2);

  drawList.puck1 = new Puck(canvas.height / 2);

  window.requestAnimationFrame(update);
};
window.onload = init;

var joinButton = function joinButton() {
  if (document.querySelector("#usernameField").value.indexOf('<') > -1) {
    alert("Invalid Character!");
    return;
  }

  if (document.querySelector("#usernameField").value) {
    socket.emit('join', {
      name: document.querySelector("#usernameField").value
    });
  } else {
    alert("You must enter a username!");
  }
};

var onMouseMove = function onMouseMove(e) {
  var newOffsetY = e.y - canvas.offsetTop;

  drawList.leftPaddle.y = newOffsetY;
};

//const onCanvasClick = (e) =>{
//  ctx.save();
//  //console.dir(e);
//
//  //use offsetX and offsetY
//  //  ctx.fillStyle = "red";
//  //  ctx.fillRect(e.offsetX,e.offsetY,20,20);
//
//
//  if (currentScene === "title"){
//    currentScene = "gameplay";
//  }
//
//  ctx.restore();
//}

var draw = function draw() {
  ctx.save();

  drawMainLine();

  drawScore();

  var keys = Object.keys(drawList);

  for (var i = 0; i < keys.length; i++) {
    var toDraw = drawList[keys[i]];

    toDraw.drawThis();
  }

  ctx.restore();
};

var drawMainLine = function drawMainLine() {
  ctx.save();

  ctx.setLineDash([10]);

  ctx.strokeStyle = "white";

  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.restore();
};

var drawScore = function drawScore() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  //left
  ctx.fillText(drawList.leftPaddle.score.toString(), canvas.width / 2 - 25, 25);

  //right
  ctx.fillText(drawList.rightPaddle.score.toString(), canvas.width / 2 + 25, 25);

  ctx.restore();
};

var findScreen = function findScreen() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Find a room to start", canvas.width / 2, canvas.height / 2);

  ctx.restore();
};

var waitScreen = function waitScreen() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Waiting for game to start...", canvas.width / 2, canvas.height / 2);

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

  if (currentScene === "find") {
    findScreen();
  } else if (currentScene === "gameplay") {
    gameplay();
  } else if (currentScene === "wait") {
    waitScreen();
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

    this.width = canvas.width / 100;
    this.height = canvas.height / 8;

    this.score = 0;
  }

  _createClass(Paddle, [{
    key: "drawThis",
    value: function drawThis() {
      ctx.save();

      ctx.fillStyle = "white";

      var newY = this.y;

      if (newY > 500 - this.height / 2) {
        newY = 500 - this.height / 2;
      } else if (newY < 0 + this.height / 2) {
        newY = 0 + this.height / 2;
      }

      var drawX = this.x - this.width / 2;
      var drawY = newY - this.height / 2;

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
  function Puck(yPos) {
    _classCallCheck(this, Puck);

    this.x = canvas.width / 2;
    this.y = yPos;

    this.spawnX = this.x;
    this.spawnY = this.y;

    this.velocityX = 1;
    this.velocityY = 1;

    this.velocityMult = 8;
    this.velocityMultCap = 14;

    this.width = canvas.width / 60;
    this.height = this.width;
  }

  //  increaseVelocityMult(){
  //
  //    if(!(this.velocityMult > this.velocityMultCap)){
  //      this.velocityMult += .3;
  //    }
  //  }

  _createClass(Puck, [{
    key: "respawn",
    value: function respawn(spawnSide) {
      this.x = this.spawnX;

      var newY = Math.random() * canvas.height;
      this.y = newY;

      this.velocityX = spawnSide;

      var newVelY = 1;
      if (Math.random() > .5) {
        newVelY = -1;
      }

      this.velocityY = newVelY;

      this.velocityMult = 6;
    }
  }, {
    key: "drawThis",
    value: function drawThis() {

      //movement
      this.checkCollisions();

      this.x += this.velocityX * this.velocityMult;
      this.y += this.velocityY * this.velocityMult;

      //drawing
      ctx.save();

      ctx.fillStyle = "white";

      var drawX = this.x - this.width / 2;
      var drawY = this.y - this.height / 2;

      ctx.fillRect(drawX, drawY, this.width, this.height);

      ctx.restore();
    }
  }, {
    key: "checkCollisions",
    value: function checkCollisions() {
      //check X
      if (this.x <= 5) {
        //      this.x = 5;
        //      this.flipX();
        drawList.rightPaddle.score++;
        this.respawn(1);
      } else if (this.x >= canvas.width - 5) {
        //      this.x = (canvas.width-5);
        //      this.flipX();
        drawList.leftPaddle.score++;
        this.respawn(-1);
      }

      //check Y
      if (this.y <= 5) {
        this.y = 5;
        this.flipY();
      } else if (this.y >= canvas.height - 5) {
        this.y = canvas.height - 5;
        this.flipY();
      }

      //check Paddles
      this.checkPaddles();
    }
  }, {
    key: "checkPaddles",
    value: function checkPaddles() {
      //left paddle
      var lPaddle = drawList.leftPaddle;

      var lPaddleXBool = this.x - this.width / 2 <= lPaddle.x + lPaddle.width / 2 && this.x + this.width / 2 >= lPaddle.x - lPaddle.width / 2;
      var lPaddleYBool = this.y - this.height / 2 <= lPaddle.y + lPaddle.height / 2 && this.y + this.height / 2 >= lPaddle.y - lPaddle.height / 2;
      if (lPaddleXBool && lPaddleYBool) {
        this.flipX();

        var newY = (this.y - lPaddle.y) / lPaddle.height * 3;

        this.velocityY = newY;
      }

      //lright paddle
      var rPaddle = drawList.rightPaddle;

      var rPaddleXBool = this.x + this.width / 2 >= rPaddle.x - rPaddle.width / 2 && this.x - this.width / 2 <= rPaddle.x + rPaddle.width / 2;
      var rPaddleYBool = this.y - this.height / 2 <= rPaddle.y + rPaddle.height / 2 && this.y + this.height / 2 >= rPaddle.y - rPaddle.height / 2;
      if (rPaddleXBool && rPaddleYBool) {
        this.flipX();

        var _newY = (this.y - rPaddle.y) / rPaddle.height * 3;

        this.velocityY = _newY;
      }
    }
  }, {
    key: "flipY",
    value: function flipY() {
      this.velocityY *= -1;

      //    this.increaseVelocityMult();
    }
  }, {
    key: "flipX",
    value: function flipX() {
      this.velocityX *= -1;

      //    this.increaseVelocityMult();
    }
  }]);

  return Puck;
}();
