var submarineLeftImg, submarineRightImg;
var backgroundImg;
var gameOverImg;

var END = 0;
var PLAY = 1;
var gameState = PLAY;

var submarine, gameOver, restart;
var bubbles = [];
var score = 0, counter = 0;
var highScore = 0; 
var bubbleSpawnInterval = 30; 
var bubbleSpawnTimer = 0;

var timer = 2; 
var timerInterval;

var bgMusic, popSound, bonusSound;

var bonusText, showText;

var firebase

function preload() {
  backgroundImg = loadImage("img/background.png");
  submarineRightImg = loadImage("img/submarineRight.png");
  submarineLeftImg = loadImage("img/submarineLeft.png");


  restartImg = loadImage("img/Restart.png");
  gameOverImg = loadImage("img/gameOverImg.png");

  bgMusic = loadSound("music/BackgroundMusic.mp3")
  popSound = loadSound("music/Pop.wav")
  bonusSound = loadSound("music/BonusSound.mp3")
}

function setup() {
  createCanvas(930, 600);

  bgMusic.setVolume(0.5)
  bgMusic.loop()

  database = firebase.database()
  
  submarine = createSprite(50, 50, 10, 10);
  submarine.addImage("submarineRight", submarineRightImg);
  submarine.addImage("submarineLeft", submarineLeftImg);
  submarine.scale = 0.15;
  submarine.setCollider("rectangle", 0, 0, submarine.width / 2, submarine.height / 2); 
  

  gameOver = createSprite(width/2, height/2 - 50);
  gameOver.addImage(gameOverImg); 
  gameOver.scale = 0.9
  gameOver.visible = false;

  restart = createSprite(width/2, height/2 + 150)
  restart.addImage(restartImg); 
  restart.scale = 0.2
  restart.visible = false;

 
  for (let i = 0; i < 5; i++) { 
    bubbles.push(new Bubble());
  }

 
  timerInterval = setInterval(decrementTimer, 1000);

}

function draw() {
  background(backgroundImg);

  database.ref("/Highscore").on("value",(data)=>{
    highScore = data.val()
  })


  if (gameState === PLAY) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      bubbles[i].update();
      bubbles[i].display();

      if (bubbles[i].collidesWith(submarine)) {
        score += Math.round(bubbles[i].size / 10);
        counter += Math.round(bubbles[i].size / 10);
        popSound.play()
        bubbles.splice(i, 1);
      }
    }

    
    if (counter >= 10){
      counter -= 10
      timer += 2
      bonusSound.play()
      showText = true
      setTimeout(()=>{
        showText = false
        console.log("sdf")
    },2000)
      
    }


    if (showText){
      showBonusText()
    }

    bubbleSpawnTimer++;
    if (bubbleSpawnTimer >= bubbleSpawnInterval) {
      bubbles.push(new Bubble());
      bubbleSpawnTimer = 0;
    }
  }

  drawSprites();
  textSize(20);
  fill(255);
  text("Score: " + score, 10, 20);


  text("High Score: " + highScore, width - 150, 20);

  text("Time: " + timer, 10, 50);

  if (score > highScore) {
    highScore = score;
    database.ref("/").set({
      Highscore: highScore
    })
  }

  if (timer <= 0) {
    gameState = END;
  }

  if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;

    

    if (mousePressedOver(restart)) {
      reset();
    }
  }


  handlePlayerControls();
}

function reset() {
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;
  submarine.position.x = 50;
  submarine.position.y = 50;
  submarine.velocityX = 0;
  submarine.velocityY = 0;
  score = 0;
  counter = 0


  bubbles = [];
  for (let i = 0; i < 5; i++) { 
    bubbles.push(new Bubble());
  }
  bubbleSpawnTimer = 0;


  timer = 30;
}

function handlePlayerControls() {
  if (gameState === PLAY) {
    if (keyDown(RIGHT_ARROW)) {
      submarine.velocityX = 3.1;
      submarine.changeImage("submarineRight", submarineRightImg);
    }
    if (keyDown(LEFT_ARROW)) {
      submarine.velocityX = -3.1;
      submarine.changeImage("submarineLeft", submarineLeftImg);
    }
    if (keyDown(UP_ARROW)) {
      submarine.velocityY = -2.5;
    }
    if (keyDown(DOWN_ARROW)) {
      submarine.velocityY = 2.5;
    }
  } else {

    submarine.velocityX = 0;
    submarine.velocityY = 0;
  }
}

function keyReleased() {
  submarine.velocityX = 0;
  submarine.velocityY = 0;
}


class Bubble {
  constructor() {
  
    let corner = Math.floor(random(4));
    switch(corner) {
      case 0: // Top-left corner
        this.x = 0;
        this.y = 0;
        break;
      case 1: // Top-right corner
        this.x = width;
        this.y = 0;
        break;
      case 2: // Bottom-left corner
        this.x = 0;
        this.y = height;
        break;
      case 3: // Bottom-right corner
        this.x = width;
        this.y = height;
        break;
    }
    this.size = random(10, 70);
    this.speedX = random(-2, 2);
    this.speedY = random(-2, 2);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
   
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  display() {
    fill(173, 216, 230, 150); 
    noStroke();
    ellipse(this.x, this.y, this.size);
  }

  collidesWith(submarine) {
    let d = dist(this.x, this.y, submarine.position.x, submarine.position.y);
    return d < (this.size / 2 + submarine.width * submarine.scale / 4); 
  }
}

function decrementTimer() {
  if (timer > 0) {
    timer--;
  }
}

function showBonusText(){ 
    textSize(20);  
    fill(0,255,0);
    text("+2",100,50)
}
