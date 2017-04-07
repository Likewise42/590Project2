class Puck{
  constructor(xPos,yPos) {
    this.x = xPos;
    this.y = yPos;
    
    this.velocityX;
    this.velocityY;
    
    this.velocityMult = 1;
  }
  
  increaseVelocityMult(){
    this.velocityMult += .1;
  }
}