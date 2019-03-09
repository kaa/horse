import Phaser from "phaser";
import horseImg from "./assets/horse.png";
import jumpImg from "./assets/jump.png";
import backgroundImg from "./assets/ground.png";
import obstaclesImg from "./assets/obstacles.png";

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 600 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var background, obstacles = [], obstaclesGroup, horse;

function collideWithObstacle(a) {
  a.scene.endGame();
}

function update (time, delta) {
    const cursors = this.input.keyboard.createCursorKeys();
    if(this.running)
      this.offset += delta*this.speed;
    if (cursors.up.isDown && horse.body.touching.down)
    {
        horse.setVelocityY(-300);
        horse.anims.play('jump');
    } else if(horse.body.touching.down) {
        horse.anims.play("walk", true);
    }
    background.setPosition(480-(this.offset%165), 560, 0)

    if(obstacles.length<1) {
      const sprite = obstaclesGroup.create(300,522,"obstacles",Math.floor(Math.random()*5));
      sprite.enableBody(sprite);
      sprite.body.allowGravity = false;
      sprite.body.immovable = true;
      sprite.body.setSize(10,10, 50, 50)
      sprite.scored = false;
      const obstacle = {
        sprite,
        start: this.offset
      };
      obstacles.push(obstacle)
      console.log("added");
    }
    for(var i=0; i<obstacles.length; i++) {
      const pos = this.offset-obstacles[i].start;
      if(pos>800) {
        obstacles[i].sprite.destroy();
        obstacles.splice(i,1);
        console.log("removed");
      } else {
        obstacles[i].sprite.setPosition(800-pos,522)
      }
    }
}

function preload ()
{
    this.load.spritesheet('horse', horseImg, { frameWidth: 125, frameHeight: 125 })
    this.load.spritesheet('jump', jumpImg, { frameWidth: 125, frameHeight: 125 })
    this.load.spritesheet("obstacles", obstaclesImg, { frameWidth: 120, frameHeight: 120})
    this.load.image("background", backgroundImg)
}

function create ()
{
  this.endGame = function() {
    this.speed = 0;
    this.running = false;
    horse.anims.stop()
  }
  this.running = true;
    this.speed = 0.2;
    this.offset = 0;
    this.cameras.main.backgroundColor.setTo(255,255,255);

    // Obstacles
    obstaclesGroup = this.physics.add.group();

    // Fixed ground
    const groundSprite = this.physics.add.staticImage(400, 585, null, null).setDisplaySize(800,5).refreshBody();

    // Scrolling background
    background = this.add.tileSprite(400, 540, 960, 60, 'background')

    // Running horse
    horse = this.physics.add.sprite(150, 50, 'horse')
    horse.body.setSize(100, 70);
    horse.setCollideWorldBounds(true);
    this.physics.add.collider(horse, obstaclesGroup, null, collideWithObstacle);
    this.physics.add.collider(horse, groundSprite);
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('horse', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: 0
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('jump', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: 0
    });
    horse.anims.load('walk');
    horse.anims.load('jump');
}
