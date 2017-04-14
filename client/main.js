let body;
let canvas;
let ctx;
let socket;
let hash;
let currentScene = "find";
let drawList = {};
let host = {};
let mouseLocs = {};
let inRoom = false;
let codyImg;
let codyAudio;
let pongAudio;
let pongScoreAudio;
let name;


const init = () => {
  //socket stuff
  socket = io.connect();

  codyImg = new Image();
  codyImg.src = './assets/assetsMedia/img/codyHouse.png';

  codyAudio = new Audio('./assets/assetsMedia/audio/cory.mp3');
  pongAudio = new Audio('./assets/assetsMedia/audio/pong.wav');
  pongScoreAudio = new Audio('./assets/assetsMedia/audio/pongScore.wav');


  socket.on('connect', ()=>{
    console.log('connected to the server');

    document.querySelector("#usernameButton").onclick = joinButton;
    document.querySelector("#joinRoomButton").onclick = joinRoomButton;
    document.querySelector("#hostRoomButton").onclick = hostRoomButton;
    document.querySelector("#leaveButton").onclick = leaveRoom;

    socket.on('nameValid', (data)=>{
      document.querySelector("#usernameRow").style.display = "none";
      document.querySelector("#joinHostRow").style.display = "block";
    });

    socket.on('nameInvalid', (data)=>{
      alert('Name already in use!');
    });

    socket.on('roomHosted',(data)=>{
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

    socket.on('roomJoined',(data)=>{
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

    socket.on('roomNaN',()=>{
      alert('Room does not exist');
    });

    socket.on('clientJoined',(data)=>{
      document.querySelector("#p2Ele").innerHTML = data;

      currentScene = "readyHost";
    });

    socket.on('gameStart', ()=>{
      currentScene = "gameplay";
    });

    socket.on('clientUpdate', (data)=>{
      drawList.rightPaddle.y = data.y;
    });

    socket.on('hostUpdate', (data)=>{

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

    socket.on('opponentLeft', ()=>{
      if(inRoom){
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

  drawList.leftPaddle = new Paddle(canvas.width/10,canvas.height/2);
  drawList.rightPaddle = new Paddle((canvas.width/10)*9,canvas.height/2);

  drawList.puck1 = new Puck(canvas.height/2);

  window.requestAnimationFrame(update);
};
window.onload = init;

const leaveRoom = () =>{
  socket.emit('leaveRoom');

  //reset values to beginning
  document.querySelector("#p2Ele").innerHTML = '...';

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

const joinButton = () =>{
  if(document.querySelector("#usernameField").value.indexOf('<') > -1){
    alert("Invalid Character!");
    return;
  }

  if(document.querySelector("#usernameField").value) {
    name = document.querySelector("#usernameField").value;
    if(name === 'Cody'|| name === 'cody'){
      codyAudio.play();
    }
    socket.emit('join', {
      name: name,
    });

  } else {
    alert("You must enter a username!");
  }
}

const joinRoomButton = () => {

  if(document.querySelector("#joinField").value.indexOf('<') > -1){
    alert("Invalid Character!");
    return;
  }

  if(document.querySelector("#joinField").value) {
    console.log("join emit fired");
    socket.emit('joinRoom', {
      name: document.querySelector("#joinField").value,
    });
    
    document.querySelector("#joinField").value = '';

  } else {
    alert("You must enter a roomname!");
  }
}	

const hostRoomButton = () => {
  if(document.querySelector("#hostField").value.indexOf('<') > -1){
    alert("Invalid Character!");
    return;
  }

  if(document.querySelector("#hostField").value) {
    socket.emit('hostRoom', {
      name: document.querySelector("#hostField").value,
    });
    
    document.querySelector("#hostField").value = '';

  } else {
    alert("You must enter a room name!");
  }

}	

const onMouseMove = (e) =>{

  if(host === false){
    socket.emit('clientUpdate', {
      y: e.clientY - canvas.offsetTop,
    });
  } else if(host === true && currentScene === "gameplay"){
    const newOffsetY = e.clientY - canvas.offsetTop;
    drawList.leftPaddle.y = newOffsetY;
  }
}

const onCanvasClick = (e) =>{
  ctx.save();
  //console.dir(e);

  //use offsetX and offsetY
  //  ctx.fillStyle = "red";
  //  ctx.fillRect(e.offsetX,e.offsetY,20,20);


  if (currentScene === "readyHost"){
    currentScene = "gameplay";

    socket.emit('gameStartHost');
  }

  ctx.restore();
}

const drawHost = () => {
  ctx.save();

  drawMainLine();

  drawScore();

  const keys = Object.keys(drawList);

  for(let i=0; i<keys.length; i++){
    const toDraw = drawList[keys[i]];

    toDraw.drawThis();
  }

  ctx.restore();

  socket.emit('hostUpdate', {
    leftPaddle: {
      x: drawList.leftPaddle.x,
      y: drawList.leftPaddle.y,
      score: drawList.leftPaddle.score,
    },
    rightPaddle: {
      x: drawList.rightPaddle.x,
      y: drawList.rightPaddle.y,
      score: drawList.rightPaddle.score,
    },
    puck1: {
      x: drawList.puck1.x,
      y: drawList.puck1.y,

      velocityX: drawList.puck1.velocityX,
      velocityY: drawList.puck1.velocityY,

      velocityMult: drawList.puck1.velocityMult,
    },
  });
}

const drawClient = () =>{
  ctx.save();

  drawMainLine();

  drawScore();

  const keys = Object.keys(drawList);

  console.log(keys.length);

  for(let i=0; i<keys.length; i++){
    const toDraw = drawList[keys[i]];

    toDraw.drawThis();
  }

  ctx.restore();
}

const drawMainLine = () =>{
  ctx.save();

  ctx.setLineDash([10]);

  ctx.strokeStyle = "white";

  ctx.beginPath();
  ctx.moveTo(canvas.width/2,0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.stroke();

  ctx.restore();
}

const drawScore = () =>{
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  //left
  ctx.fillText(drawList.leftPaddle.score.toString(),canvas.width/2 - 25, 25);

  //right
  ctx.fillText(drawList.rightPaddle.score.toString(),canvas.width/2 + 25, 25);

  ctx.restore();
}

const findScreen = () =>{
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Find a room or host a room to start",canvas.width/2,canvas.height/2);

  ctx.restore();
}

const waitScreen = () =>{
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Waiting for another player...",canvas.width/2,canvas.height/2);

  ctx.restore();
}

const readyHostScreen = () =>{
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Click this to start",canvas.width/2,canvas.height/2);

  ctx.restore();
}

const readyClientScreen = () =>{
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Waiting for the host to start the game",canvas.width/2,canvas.height/2);

  ctx.restore();
}

const gameplay = () =>{
  ctx.save();

  if(host === true){
    drawHost();	
  } else if(host === false){
    drawClient();
  } else {
    console.log("ryan hecked up");
  }

  ctx.restore();
}

const update = () => {

  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width, canvas.height);

  if(name === 'Cody'|| name === 'cody'){
    ctx.drawImage(codyImg,0,0,canvas.width, canvas.height);
  }

  if(currentScene === "find"){
    findScreen();
  } else if( currentScene === "gameplay"){
    gameplay();
  } else if( currentScene === "wait"){
    waitScreen();
  } else if( currentScene === "readyHost"){
    readyHostScreen();
  } else if( currentScene === "readyClient"){
    readyClientScreen();
  }

  requestAnimationFrame(update);
}