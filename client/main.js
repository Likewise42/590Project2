let body;
let canvas;
let ctx;
let socket;
let hash;
let currentScene = "title";
let drawList = {};


const init = () => {
  body = document.querySelector('body');
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  body.onmousemove = onMouseMove;

  canvas.onclick = onCanvasClick;

  drawList.leftPaddle = new Paddle(canvas.width/10,canvas.height/2);
  drawList.rightPaddle = new Paddle((canvas.width/10)*9,canvas.height/2);

  drawList.puck1 = new Puck(canvas.height/2);

  window.requestAnimationFrame(update);
}
window.onload = init;

const onMouseMove = (e) =>{
  const newOffsetY = e.y - canvas.offsetTop;

  drawList.leftPaddle.y = newOffsetY;
}

const onCanvasClick = (e) =>{
  ctx.save();
  //console.dir(e);

  //use offsetX and offsetY
  //  ctx.fillStyle = "red";
  //  ctx.fillRect(e.offsetX,e.offsetY,20,20);


  if (currentScene === "title"){
    currentScene = "gameplay";
  }

  ctx.restore();
}

const draw = () => {
  ctx.save();
  
  drawMainLine();
  
  drawScore();
  
  const keys = Object.keys(drawList);

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

const titleScreen = () =>{
  ctx.save();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Pong!",canvas.width/2,canvas.height/2);
  ctx.fillText("Click to start",canvas.width/2,(canvas.height/2)+(canvas.height/10));

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

  if(currentScene === "title"){
    titleScreen();
  } else if( currentScene === "gameplay"){
    gameplay();
  }


  requestAnimationFrame(update);
}