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

  window.requestAnimationFrame(update);
}
window.onload = init;

const onMouseMove = (e) =>{
  //console.log(e.offsetY);
  
  drawList.leftPaddle.y = e.offsetY;
  if(drawList.leftPaddle.y >500){
    drawList.leftPaddle.y = 500;
  } else if(drawList.leftPaddle.y < 0){
    drawList.leftPaddle.y = 0;
  }
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
  const keys = Object.keys(drawList);

  for(let i=0; i<keys.length; i++){
    const toDraw = drawList[keys[i]];

    toDraw.drawThis();

  }

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