/*CUSTOMIZATIONS:
1. how to center the game window
1.5. MAKE THE DRAGONS SLOWER OMFG
2. animate the sprites (squid trying to eat hermit crab, dodge trash + sharks/enemies)
2.5. add sharks after you eat the first crab? level 2?
3. add some animated bubbles
4. add up down keyboard cursor controls
5. restructure function calls more like last tutorial for simplicity and readability
6. add arcade physics? only if you need more

*/

// create a new scene object named "Game"
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene (our own custom variables - these are NOT part of the Phaser API)
gameScene.init = function() {
    this.playerSpeed = 1.5;
    this.enemyMaxY = 330;
    this.enemyMinY = 30;
};

// load asset files for our game
gameScene.preload = function() {
    // load images
    this.load.image('background', 'assets/underwater_bg.png');
    this.load.spritesheet('player', 'assets/squid_sprite_32.png', { frameWidth: 32, frameHeight: 36 });
    this.load.spritesheet('shark', 'assets/shark.png', { frameWidth: 32, frameHeight: 16 });
    this.load.spritesheet('crab', 'assets/hermitcrab.png', { frameWidth: 32, frameHeight: 32 });
};

// executed once, after assets were loaded
gameScene.create = function() {
    // background
    let bg = this.add.sprite(0, -65, 'background');
    // change origin to the top-left of the sprite, instead of center(default)
    bg.setOrigin(0,0);


    // player
        //"this." gives access to "current scene object"
        //"this.sys.game" accesses "global game object"
        //"this.sys.game.config" accesses the coniguration we defined at the beginning of game
        //"this.sys.game.config.height / 2" makes y-coord middle of viewport
        //this.player creates variable accessable within this scene
    this.player = this.add.sprite(40, this.sys.game.config.height / 2, 'player');


// || ANIMATION
    // player
    this.anims.create({
        key: 'player-move',

        frames: this.anims.generateFrameNumbers('player', { start:0, end:2 }),
        frameRate: 10,
        repeat: -1 //tells animation to loop
    });

    this.anims.create({
        key: 'player-stop',
        frames: [ { key: 'player', frame: 0 } ],
        frameRate: 20
    });

    // sharks
    this.anims.create({
        key: 'sharks-move',
        frames: this.anims.generateFrameNumbers('shark', { frames: [0, 4, 2, 3, 1, 5] }),
        frameRate: 8,
        repeat: -1 //tells animation to loop
    });

    // crab
    this.anims.create({
        key: 'crab-peek',
        frames: this.anims.generateFrameNumbers('crab', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] }),
        frameRate: 5,
        repeat: -1 //tells animation to loop
    });

    
    //Controls (pt1) rest of cursor info in Update()
    cursors = this.input.keyboard.createCursorKeys();


    // goal
    this.food = this.add.sprite(this.sys.game.config.width - 65, this.sys.game.config.height - 43, 'crab');
    this.food.anims.play('crab-peek', true);

    // group of enemies
    this.enemies = this.add.group({
        key: 'shark',
        repeat: 5,
        setXY: {
            x: 110,
            y: 100,
            stepX: 80,
            stepY: 20
        }
    });

    // set speeds
    Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
        //Phaser.Actions.Call allows us to call a method on each array element
        //enemy.speed = Math.random() * 1.2 + 1;
        enemy.speed = Math.random() + 1;
    }, this); //We are passing this as the context (although not using it)--> WTF does that mean??


    // player is alive
    this.isPlayerAlive = true;

    // reset camera effects
    this.cameras.main.resetFX();
};

// executed on every frame (60 times per second, depending on browser)
gameScene.update = function() {
    // only if the player is alive
    if (!this.isPlayerAlive) {
        return;
    }

    //Controls (pt2)
    //move left
    if (cursors.left.isDown)
    {
        this.player.x += (this.playerSpeed) * -1;

        this.player.anims.play('player-move', true);
    }
    //move right
    else if (cursors.right.isDown)
    {
        this.player.x += this.playerSpeed;

        this.player.anims.play('player-move', true);
    }
    //move up
    else if (cursors.up.isDown)
    {
        this.player.y += (this.playerSpeed) * -1;

        this.player.anims.play('player-move', true);
    }
    //move down
    else if (cursors.down.isDown)
    {
        this.player.y += this.playerSpeed;

        this.player.anims.play('player-move', true);
    }
    //not moving
    else
    {
        this.player.anims.play('player-stop');
    }

    // check for food collision
    // different than before, not using physics system
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.food.getBounds())) {
        this.youWon();
    }

    // enemy movement, animation & collision
    let enemies = this.enemies.getChildren();
    let numEnemies = enemies.length;

    for (let i = 0; i < numEnemies; i++) {
        // move enemies
        enemies[i].y += enemies[i].speed;
        // reverse movement if reached the edges
        if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
            enemies[i].speed *= -1;
        } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
            enemies[i].speed *= -1;
        }

        //animate enemies
        enemies[i].anims.play('sharks-move', true);

        // enemy collision
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {
            this.gameOver();
            break;
        }
    }   
};

// end the game
gameScene.gameOver = function() {
    // flag to set player is dead
    this.isPlayerAlive = false;

    // shake the camera
    this.cameras.main.shake(500);

    // fade camera
    this.time.delayedCall(250, function() {
        this.cameras.main.fade(250);
    }, [], this);

    // restart game
    this.time.delayedCall(500, function() {
      this.scene.restart();
    }, [], this);
};

// end the game, but you won
gameScene.youWon = function() {
    this.isPlayerAlive = false;

    // add text
    let textConfig = {
        fontFamily: 'arial',
        fontSize: '90px', 
        color: '#edb0f9',
        stroke: '#000080',
        strokeThickness: 2
    }

    this.winText = this.add.text(this.sys.game.config.width / 4, this.sys.game.config.height / 3, 'You Win!', textConfig );


};

// our game's configuration
let config = {
  type: Phaser.AUTO,  //Phaser will decide how to render our game (WebGL or Canvas)
  width: 640, // game width
  height: 360, // game height
  scene: gameScene // our newly created scene object
};

// create the game object, and pass it the configuration
let game = new Phaser.Game(config);

