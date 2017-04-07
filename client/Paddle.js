class Paddle{
  constructor(xPos,yPos) {
    this.x = xPos;
    this.y = yPos;
    
    this.width = canvas.width/20;
    this.height = canvas.height/4;
  }
  
  drawThis(){
    ctx.save();
    
    ctx.fillStyle = "white";  
    const drawX = this.x - (this.width/2);
    const drawY = this.y - (this.height/2);
    ctx.fillRect(drawX,drawY,this.width,this.height);
    
    ctx.restore();
  }
}