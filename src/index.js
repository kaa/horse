import Phaser from "phaser";
import { Scene } from "phaser";
import horseImg from "./assets/horse.png";
import jumpImg from "./assets/jump.png";
import backgroundImg from "./assets/ground.png";
import obstaclesImg from "./assets/obstacles.png";
import numbersImg from "./assets/numbers.png";

class GameScene extends Scene {
  constructor(config) {
    super(config);
  }

  update(time, delta) {
    const cursors = this.input.keyboard.createCursorKeys();

    if(this.running) {
      this.physics.world.timeScale *= 0.9999;
      this.horse.anims.setTimeScale(1/this.physics.world.timeScale);
    }

    if (cursors.up.isDown && this.horse.body.touching.down) {
        this.horse.body.setVelocityY(-400);
        this.horse.anims.play('jump');
    } else if(this.horse.body.touching.down && this.speed>0) {
        this.horse.anims.play("walk", true);
    }

    if(this.ground.x<=-165)
      this.ground.setX(0)

    if(this.obstacles.length<4 && Math.random()>0.98 && (this.obstacles.length===0 || this.obstacles[this.obstacles.length-1].x<550)) {
      this.obstacles.push(this.createObstacle(Math.floor(Math.random()*5)))
    }
    for(var i=0; i<this.obstacles.length; i++) {
      if(this.obstacles[i].x<260 && this.obstacles[i].value) {
        this.score += this.obstacles[i].value;
        this.obstacles[i].value = 0;
      }
      if(this.obstacles[i].x>=-90) {
        break;
      }
      this.obstacles[i].destroy();
      this.obstacles.splice(i,1);
    }

    // Lerp score
    const scoreDelta = this.score-this.displayedScore;
    if(scoreDelta<=1) {
      this.displayedScore = this.score;
    } else {
      this.displayedScore += scoreDelta*0.1;
    }
    var str = Math.floor(this.displayedScore).toString();
    for(let i=str.length-1; i>=0; i--) {
      this.counter[this.counter.length-str.length+i].setFrame(parseInt(str[i]));
    }
  }

  createObstacle(frame) {
    var positions = [
      [15,60,80,60], 
      [20,70,50,50], 
      [25,90,60,30], 
      [25,70,60,50], 
      [5,80,110,30], 
    ]
    var values = [200, 50, 20, 50, 100];
    var obstacle = this.physics.add.sprite(890, 650-(positions[frame][1]+positions[frame][3]), "obstacles", frame);
    this.obstacleGroup.add(obstacle);
    this.physics.add.existing(obstacle, false);
    obstacle.body.setAllowGravity(false);
    obstacle.body.setImmovable();
    obstacle.body.setSize(positions[frame][2], positions[frame][3]);
    obstacle.body.setOffset(positions[frame][0], positions[frame][1]);
    obstacle.body.setVelocityX(-300);
    obstacle.value = values[frame];
    return obstacle
  }

  endGame() {
    if(!this.running) return;
    this.speed = 0;
    this.running = false;
    this.horse.anims.stop();
    this.cameras.main.shake(100, 0.05, false, (_, i) => {
      if(i<1) return;
      this.scene.restart();
    })
  }

  preload() {
    this.load.spritesheet('horse', horseImg, { frameWidth: 125, frameHeight: 125 })
    this.load.spritesheet('jump', jumpImg, { frameWidth: 125, frameHeight: 125 })
    this.load.spritesheet("obstacles", obstaclesImg, { frameWidth: 120, frameHeight: 120})
    this.load.spritesheet("numbers", numbersImg, { frameWidth: 50, frameHeight: 50 });
    this.load.image("background", backgroundImg)
  }


  collideWithObstacle(a) {
    this.endGame();
  }

  create () {
    this.obstacles = []
    this.running = true;
    this.speed = 0.2;
    this.score = 0;
    this.displayedScore = 0;

    this.physics.world.timeScale = 0.8;

    this.cameras.main.backgroundColor.setTo(255,255,255);

    // Obstacles
    this.obstacleGroup = this.physics.add.group();

    // Ground
    this.ground = this.add.tileSprite(0, 520, 990, 60, 'background');
    this.ground.setOrigin(0)
    this.physics.add.existing(this.ground, false);
    this.ground.body.setAllowGravity(false);
    this.ground.body.setImmovable();
    this.ground.body.setSize(960, 5);
    this.ground.body.setOffset(0,70);
    this.ground.body.setVelocityX(-250);
    this.ground.body.setFriction(0,0);
    this.ground.body.setDrag(0);

    // Horse
    this.horse = this.add.sprite(200, 510, 'horse')
    this.physics.add.existing(this.horse, false);
    this.horse.body.setEnable()
    this.horse.body.setSize(60, 70);
    this.horse.body.setOffset(30, 50);

    // Counter
    this.counter = [];
    for(let i=0; i<6; i++) {
      this.counter[i] = this.add.image(500+50*i, 100, "numbers", 0);
    }

    // Create animations
    var walk = this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('horse', { start: 0, end: 4 }).reverse(),
        frameRate: 10,
        repeat: 0
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('jump', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: 0
    });
    this.anims.load('walk');
    this.anims.load('jump');

    this.physics.add.collider(this.horse, this.obstacleGroup, null, t => this.collideWithObstacle());
    this.physics.add.collider(this.horse, this.ground);
  }
}


var game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 600 }
        }
    },
    scene: {},
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    }
});
game.scene.add('Main', new GameScene())
game.scene.start("Main");

