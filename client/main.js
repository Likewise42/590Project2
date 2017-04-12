let body;
let canvas;
let ctx;
let socket;
let hash;
let currentScene = "gameplay";
let drawList = {};


const init = () => {
  //socket stuff
  socket = io.connect();

  socket.on('connect', ()=>{
    console.log('connected to the server');

    document.querySelector("#usernameButton").onclick = joinButton;

    socket.on('nameValid', (data)=>{
      document.querySelector("#usernameRow").style.display = "none";
      document.querySelector("#nameAlert").style.display = "none";
      document.querySelector("#joinHostRow").style.display = "block";
    });

    socket.on('nameInvalid', (data)=>{
      document.querySelector("#nameAlert").style.display = "block";
    });
  });

  body = document.querySelector('body');
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  body.onmousemove = onMouseMove;

  //  canvas.onclick = onCanvasClick;

  drawList.leftPaddle = new Paddle(canvas.width/10,canvas.height/2);
  drawList.rightPaddle = new Paddle((canvas.width/10)*9,canvas.height/2);

  drawList.puck1 = new Puck(canvas.height/2);

  window.requestAnimationFrame(update);
}
window.onload = init;

const joinButton = () =>{
  if(document.querySelector("#usernameField").value.indexOf('<') > -1){
    alert("Invalid Character!");
    return;
  }

  if(document.querySelector("#usernameField").value) {
    socket.emit('join', {
      name: document.querySelector("#usernameField").value,
    });

  } else {
    alert("You must enter a username!");
  }
}

const onMouseMove = (e) =>{
  const newOffsetY = e.y - canvas.offsetTop;

  drawList.leftPaddle.y = newOffsetY;
}

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

const draw = () => {
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

	ctx.beginpath();
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
  ctx.fillText("Find a room to start",canvas.width/2,canvas.height/2);

  ctx.restore();
}

const waitScreen = () =>{
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Waiting for game to start...",canvas.width/2,canvas.height/2);

  ctx.restore();
}

const gameplay = () =>{
  ctx.save();

  draw();

  ctx.restore();
}

const update = () => {

  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width, canvas.height);

  if(currentScene === "find"){
    findScreen();
  } else if( currentScene === "gameplay"){
    gameplay();
  } else if( currentScene === "wait"){
    waitScreen();
  }


  requestAnimationFrame(update);
}