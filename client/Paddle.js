class Paddle{
  constructor(xPos,yPos) {
    this.x = xPos;
    this.y = yPos;

    this.width = canvas.width/60;
    this.height = canvas.height/6;
    
    this.score = 0;
  }

  drawThis(){
    ctx.save();

    ctx.fillStyle = "white";
    
    let newY = this.y;
    
    if(newY >(500-this.height/2)){
      newY = 500-this.height/2;
    } else if(newY< 0+this.height/2){
      newY = 0+this.height/2;
    }
    
    const drawX = this.x - (this.width/2);
    const drawY = newY - (this.height/2);

    ctx.fillRect(drawX,drawY,this.width,this.height);

    ctx.restore();
  }
}