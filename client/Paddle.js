class Paddle{
  constructor(xPos,yPos) {
    this.x = xPos;
    this.y = yPos;

    this.width = canvas.width/100;
    this.height = canvas.height/8;
    
    this.score = 0;
  }

  drawThis(){
    ctx.save();

    ctx.fillStyle = "white";
    
    if(this.y >(500-this.height/2)){
      this.y = 500-this.height/2;
    } else if(this.y< 0+this.height/2){
      this.y = 0+this.height/2;
    }
    
    const drawX = this.x - (this.width/2);
    const drawY = this.y- (this.height/2);

    ctx.fillRect(drawX,drawY,this.width,this.height);

    ctx.restore();
  }
}