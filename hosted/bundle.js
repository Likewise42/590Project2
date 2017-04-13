'use strict';

var body = void 0;
var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var hash = void 0;
var currentScene = "find";
var drawList = {};
var host = {};
var mouseLocs = {};
var inRoom = false;

var init = function init() {
  //socket stuff
  socket = io.connect();

  socket.on('connect', function () {
    console.log('connected to the server');

    document.querySelector("#usernameButton").onclick = joinButton;
    document.querySelector("#joinRoomButton").onclick = joinRoomButton;
    document.querySelector("#hostRoomButton").onclick = hostRoomButton;
    document.querySelector("#leaveButton").onclick = leaveRoom;

    socket.on('nameValid', function (data) {
      document.querySelector("#usernameRow").style.display = "none";
      document.querySelector("#nameAlert").style.display = "none";
      document.querySelector("#joinHostRow").style.display = "block";
    });

    socket.on('nameInvalid', function (data) {
      document.querySelector("#nameAlert").style.display = "block";
    });

    socket.on('roomHosted', function (data) {
      console.log(data);
      document.querySelector("#joinHostRow").style.display = "none";
      document.querySelector("#leaveRow").style.display = "block";
      document.querySelector("#playerVSRow").style.visibility = "visible";
      document.querySelector("#roomNameEle").innerHTML = data.roomName;
      document.querySelector("#p1Ele").innerHTML = data.hostName;

      currentScene = "wait";
      host = true;
      inRoom = true;
    });

    socket.on('roomJoined', function (data) {
      console.log(data);
      document.querySelector("#joinHostRow").style.display = "none";
      document.querySelector("#leaveRow").style.display = "block";
      document.querySelector("#playerVSRow").style.visibility = "visible";
      document.querySelector("#roomNameEle").innerHTML = data.roomName;
      document.querySelector("#p1Ele").innerHTML = data.hostName;
      document.querySelector("#p2Ele").innerHTML = data.clientName;

      currentScene = "readyClient";
      host = false;
      inRoom = true;
    });

    socket.on('roomNaN', function () {
      alert('Room does not exist');
    });

    socket.on('clientJoined', function (data) {
      document.querySelector("#p2Ele").innerHTML = data;

      currentScene = "readyHost";
    });

    socket.on('gameStart', function () {
      currentScene = "gameplay";
    });

    socket.on('clientUpdate', function (data) {
      drawList.rightPaddle.y = data.y;
    });

    socket.on('hostUpdate', function (data) {

      //left paddle
      drawList.leftPaddle.x = data.leftPaddle.x;
      drawList.leftPaddle.y = data.leftPaddle.y;
      drawList.leftPaddle.score = data.leftPaddle.score;

      //right paddle
      drawList.rightPaddle.x = data.rightPaddle.x;
      drawList.rightPaddle.y = data.rightPaddle.y;
      drawList.rightPaddle.score = data.rightPaddle.score;

      //puck1
      drawList.puck1.x = data.puck1.x;
      drawList.puck1.y = data.puck1.y;
      drawList.puck1.velocityX = data.puck1.velocityX;
      drawList.puck1.velocityY = data.puck1.velocityY;
      drawList.puck1.velocityMult = data.puck1.velocityMult;
    });

    socket.on('opponentLeft', function () {
      if (inRoom) {
        alert("Your Opponent Left");
        leaveRoom();
      }
    });
  });

  body = document.querySelector('body');
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  body.onmousemove = onMouseMove;

  canvas.onclick = onCanvasClick;

  drawList.leftPaddle = new Paddle(canvas.width / 10, canvas.height / 2);
  drawList.rightPaddle = new Paddle(canvas.width / 10 * 9, canvas.height / 2);

  drawList.puck1 = new Puck(canvas.height / 2);

  window.requestAnimationFrame(update);
};
window.onload = init;

var leaveRoom = function leaveRoom() {
  socket.emit('leaveRoom');

  //reset values to beginning
  //left paddle
  drawList.leftPaddle.score = 0;

  //right paddle
  drawList.rightPaddle.score = 0;

  //puck1
  drawList.puck1.x = drawList.puck1.spawnX;
  drawList.puck1.y = drawList.puck1.spawnY;
  drawList.puck1.velocityX = 1;
  drawList.puck1.velocityY = 1;
  drawList.puck1.velocityMult = 8;

  document.querySelector("#joinHostRow").style.display = "block";
  document.querySelector("#playerVSRow").style.visibility = "hidden";
  document.querySelector("#leaveRow").style.display = "none";

  currentScene = "find";
  host = false;
  inRoom = false;
};

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

var joinRoomButton = function joinRoomButton() {

  if (document.querySelector("#joinField").value.indexOf('<') > -1) {
    alert("Invalid Character!");
    return;
  }

  if (document.querySelector("#joinField").value) {
    console.log("join emit fired");
    socket.emit('joinRoom', {
      name: document.querySelector("#joinField").value
    });
  } else {
    alert("You must enter a username!");
  }
};

var hostRoomButton = function hostRoomButton() {
  if (document.querySelector("#hostField").value.indexOf('<') > -1) {
    alert("Invalid Character!");
    return;
  }

  if (document.querySelector("#hostField").value) {
    socket.emit('hostRoom', {
      name: document.querySelector("#hostField").value
    });
  } else {
    alert("You must enter a room name!");
  }
};

var onMouseMove = function onMouseMove(e) {

  if (host === false) {
    socket.emit('clientUpdate', {
      y: e.y - canvas.offsetTop
    });
  } else if (host === true && currentScene === "gameplay") {
    var newOffsetY = e.y - canvas.offsetTop;
    drawList.leftPaddle.y = newOffsetY;
  }
};

var onCanvasClick = function onCanvasClick(e) {
  ctx.save();
  //console.dir(e);

  //use offsetX and offsetY
  //  ctx.fillStyle = "red";
  //  ctx.fillRect(e.offsetX,e.offsetY,20,20);


  if (currentScene === "readyHost") {
    currentScene = "gameplay";

    socket.emit('gameStartHost');
  }

  ctx.restore();
};

var drawHost = function drawHost() {
  ctx.save();

  drawMainLine();

  drawScore();

  var keys = Object.keys(drawList);

  for (var i = 0; i < keys.length; i++) {
    var toDraw = drawList[keys[i]];

    toDraw.drawThis();
  }

  ctx.restore();

  socket.emit('hostUpdate', {
    leftPaddle: {
      x: drawList.leftPaddle.x,
      y: drawList.leftPaddle.y,
      score: drawList.leftPaddle.score
    },
    rightPaddle: {
      x: drawList.rightPaddle.x,
      y: drawList.rightPaddle.y,
      score: drawList.rightPaddle.score
    },
    puck1: {
      x: drawList.puck1.x,
      y: drawList.puck1.y,

      velocityX: drawList.puck1.velocityX,
      velocityY: drawList.puck1.velocityY,

      velocityMult: drawList.puck1.velocityMult
    }
  });
};

var drawClient = function drawClient() {
  ctx.save();

  drawMainLine();

  drawScore();

  var keys = Object.keys(drawList);

  console.log(keys.length);

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

  ctx.beginPath();
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
  ctx.fillText("Find a room or host a room to start", canvas.width / 2, canvas.height / 2);

  ctx.restore();
};

var waitScreen = function waitScreen() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Waiting for another player...", canvas.width / 2, canvas.height / 2);

  ctx.restore();
};

var readyHostScreen = function readyHostScreen() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Click this to start", canvas.width / 2, canvas.height / 2);

  ctx.restore();
};

var readyClientScreen = function readyClientScreen() {
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Waiting for the host to start the game", canvas.width / 2, canvas.height / 2);

  ctx.restore();
};

var gameplay = function gameplay() {
  ctx.save();

  if (host === true) {
    drawHost();
  } else if (host === false) {
    drawClient();
  } else {
    console.log("ryan hecked up");
  }

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
  } else if (currentScene === "readyHost") {
    readyHostScreen();
  } else if (currentScene === "readyClient") {
    readyClientScreen();
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
			if (host) {
				this.checkCollisions();

				this.x += this.velocityX * this.velocityMult;
				this.y += this.velocityY * this.velocityMult;
			}

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
