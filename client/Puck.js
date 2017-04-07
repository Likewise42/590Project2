class Puck{
  constructor(yPos) {    
    this.x = canvas.width/2;
    this.y = yPos;

    this.spawnX = this.x;
    this.spawnY = this.y;

    this.velocityX = 1;
    this.velocityY = 1;

    this.velocityMult = 8;
    this.velocityMultCap = 14;

    this.width = canvas.width/60;
    this.height = this.width;
  }

//  increaseVelocityMult(){
//
//    if(!(this.velocityMult > this.velocityMultCap)){
//      this.velocityMult += .3;
//    }
//  }

  respawn(spawnSide){
    this.x = this.spawnX;

    let newY = Math.random()*canvas.height;
    this.y = newY;

    this.velocityX = spawnSide;

    let newVelY = 1;
    if(Math.random()>.5){
      newVelY = -1;
    }

    this.velocityY = newVelY;

    this.velocityMult = 6;
  }

  drawThis(){

    //movement
    this.checkCollisions();

    this.x += this.velocityX * this.velocityMult;
    this.y += this.velocityY * this.velocityMult;

    //drawing
    ctx.save();

    ctx.fillStyle = "white";

    const drawX = this.x - (this.width/2);
    const drawY = this.y - (this.height/2);

    ctx.fillRect(drawX,drawY,this.width,this.height);

    ctx.restore();
  }

  checkCollisions(){
    //check X
    if(this.x <= 5){
      //      this.x = 5;
      //      this.flipX();
      drawList.rightPaddle.score++;
      this.respawn(1);
    } else if(this.x >= (canvas.width-5)){
      //      this.x = (canvas.width-5);
      //      this.flipX();
      drawList.leftPaddle.score++;
      this.respawn(-1);
    }

    //check Y
    if(this.y <= 5){
      this.y = 5;
      this.flipY();
    } else if(this.y >= (canvas.height-5)){
      this.y = (canvas.height-5);
      this.flipY();
    }

    //check Paddles
    this.checkPaddles();
  }

  checkPaddles(){
    //left paddle
    const lPaddle = drawList.leftPaddle;
    
    const lPaddleXBool = this.x-(this.width/2) <= lPaddle.x+(lPaddle.width/2) && this.x+(this.width/2) >= lPaddle.x-(lPaddle.width/2) ;
    const lPaddleYBool = this.y-(this.height/2) <= lPaddle.y+(lPaddle.height/2) && this.y+(this.height/2) >= lPaddle.y-(lPaddle.height/2);
    if(lPaddleXBool && lPaddleYBool){
      this.flipX();
      
      const newY = (this.y-lPaddle.y)/lPaddle.height;
      
      this.velocityY = newY;
    }
    
    
    //lright paddle
    const rPaddle = drawList.rightPaddle;
    
    const rPaddleXBool = this.x+(this.width/2) >= rPaddle.x-(rPaddle.width/2) && this.x-(this.width/2) <= rPaddle.x+(rPaddle.width/2) ;
    const rPaddleYBool = this.y-(this.height/2) <= rPaddle.y+(rPaddle.height/2) && this.y+(this.height/2) >= rPaddle.y-(rPaddle.height/2);
    if(rPaddleXBool && rPaddleYBool){
      this.flipX();
    }
  }

  flipY(){
    this.velocityY *= -1;

//    this.increaseVelocityMult();
  }

  flipX(){
    this.velocityX *= -1;

//    this.increaseVelocityMult();
  }
}