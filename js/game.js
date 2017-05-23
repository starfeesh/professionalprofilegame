// Hero construct
function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2], 8, true); // 8fps looped
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
    this.animations.add('die', [5, 6, 5, 6, 5, 6, 5, 6], 12);
    this.animations.play('stop');
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

// Hero move
Hero.prototype.move = function (direction) {
    if (this.isFrozen) { return; }

    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;

    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    let canJump = this.body.touching.down;

    if (canJump) {
        this.body.velocity.y = -JUMP_SPEED;
    }

    return canJump;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};
Hero.prototype.unfreeze = function () {
    this.body.enable = true;
    this.isFrozen = false;
};

Hero.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// Hero update
Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // dying
    if (!this.alive) {
        name = 'die';
    }
    // frozen & not dying
    else if (this.isFrozen) {
        name = 'stop';
    }
    // jumping
    else if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

// Robot construct
function Robot(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'robot');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('hover', [0, 1, 2], 6, true);
    this.animations.add('die', [0, 3, 0, 3, 0, 3, 4, 4, 4, 4, 4, 4], 12);
    this.animations.play('hover');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Robot.SPEED;

}

Robot.SPEED = 100;
Robot.prototype = Object.create(Phaser.Sprite.prototype);
Robot.prototype.constructor = Robot;

// Robot update
Robot.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Robot.SPEED;
        this.scale.x = -1;

    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Robot.SPEED;
        this.scale.x = 1;
    }

};

Robot.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// Terminal

function Terminal(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'mainframe');

    this.anchor.setTo(0.5, 1);
    this.game.physics.enable(this);
    this.body.allowGravity = false;

}

Terminal.prototype.update = function () {

};
Terminal.prototype = Object.create(Phaser.Sprite.prototype);
Terminal.prototype.constructor = Terminal;

// ===============================================================
// Game states
PlayState = {};

PlayState.preload = function () {
    // Level
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.image('background', 'images/starbackground.png');

    // Platforms
    this.game.load.image('metalground', 'images/metalground.png');
    this.game.load.image('platform:8x1', 'images/platform_8x1.png');
    this.game.load.image('platform:6x1', 'images/platform_6x1.png');
    this.game.load.image('platform:4x1', 'images/platform_4x1.png');
    this.game.load.image('platform:2x1', 'images/platform_2x1.png');
    this.game.load.image('platform:1x1', 'images/platform_1x1.png');

    // Player
    this.game.load.spritesheet('hero', 'images/spaceman.png', 36, 42);
    this.game.load.audio('sfx:jump', 'audio/jump.wav');

    // Pickup
    this.game.load.image('pickup', 'images/powercell.png');
    this.game.load.audio('sfx:pickup', 'audio/pickup.wav');

    this.game.load.image('icon:pickup', 'images/powercell.png');

    // Enemy
    this.game.load.spritesheet('robot', 'images/enemywithdeath.png', 60, 60);
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');

    // Enemy constraints
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');

    // HUD
    this.game.load.image('font:numbers', 'images/newnumbers.png');
    this.game.load.spritesheet('icon:key', 'images/chipicon.png', 34, 30);


    // Win
    this.game.load.spritesheet('door', 'images/metaldoor.png', 42, 66);
    this.game.load.image('key', 'images/chip.png');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');

    // Deco
    this.game.load.audio('bgmusic', 'audio/spacegrooveheatleybros.mp3');

    // Story
    this.game.load.spritesheet('mainframe', 'images/mainframe.png', 42, 66);

    // Minigame
    this.game.load.image('terminal', 'images/terminal.png');
    this.game.load.image('metronomebg', 'images/metronomebg.png');
    this.game.load.image('metronomemarker', 'images/metronomemarker.png');
    this.game.load.image('unlocked', 'images/unlocked.png');
    this.game.load.image('keydoor', 'images/keydoor.png');

    // CV
    this.game.load.image('overview', 'images/overview.png');
    this.game.load.image('selection', 'images/selection.png');
    this.game.load.image('screen01', 'images/multifaceted.png');
    this.game.load.image('screen02', 'images/software.png');
    this.game.load.image('screen03', 'images/languages.png');
    this.game.load.image('screen04', 'images/animation.png');
    this.game.load.image('screen05', 'images/about.png');
    this.game.load.image('screen06', 'images/experience.png');
};


PlayState.create = function () {
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON('level:1'));


    // create sound entities
    this.sfx = {
        key: this.game.add.audio('sfx:key'),
        door: this.game.add.audio('sfx:door'),
        jump: this.game.add.audio('sfx:jump'),
        pickup: this.game.add.audio('sfx:pickup'),
        stomp: this.game.add.audio('sfx:stomp')
    };

    this._createHud();
};

PlayState._loadLevel = function (data) {
    this._spawnMainframe({mainframe: data.mainframe});
    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.pickup = this.game.add.group();
    this.robots = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    data.platforms.forEach(this._spawnPlatform, this);
    this._spawnCharacters({hero: data.hero, robots: data.robots});
    // spawn important objects
    data.pickups.forEach(this._spawnPickups, this);

    this._spawnDoor(data.door.x, data.door.y);
    this._spawnKey(data.key.x, data.key.y);
    this._spawnKeyDoor(data.keydoor.x, data.keydoor.y);


    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;


};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);

    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCharacters = function (data) {
    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);

    // spawn robots
    data.robots.forEach(function (robot) {
        let sprite = new Robot(this.game, robot.x, robot.y);
        this.robots.add(sprite);
    }, this);
};

PlayState._spawnPickups = function (pickup) {
    let sprite = this.pickup.create(pickup.x, pickup.y, 'pickup');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    this.game.add.tween(sprite)
        .to({angle: 360}, 2000, Phaser.Easing.Linear.None, true)
        .loop(true);

};

PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};
PlayState._spawnKeyDoor = function (x, y) {
    this.keydoor = this.bgDecoration.create(x, y, 'keydoor');
    this.keydoor.anchor.setTo(0, 0);
    this.game.physics.enable(this.keydoor);
    this.keydoor.body.allowGravity = false;
    this.keydoor.body.immovable = true;
};

PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;

    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};

PlayState._spawnMainframe = function (data) {
    this.terminal = new Terminal(this.game, data.mainframe.x, data.mainframe.y);
    this.game.add.existing(this.terminal)
};

PlayState.init = function () {
    this.game.renderer.renderSession.roundPixels = true;

    this.keys = this.game.input.keyboard.addKeys({
        up: Phaser.KeyCode.UP,
        down: Phaser.KeyCode.DOWN,
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        back: Phaser.KeyCode.BACKSPACE,
        interact: Phaser.KeyCode.E,
        enter: Phaser.KeyCode.ENTER,
        space: Phaser.KeyCode.SPACEBAR,
        tut: Phaser.KeyCode.ESC,
        mute: Phaser.KeyCode.M
    });
    this.wasd = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.A,
        right: Phaser.KeyCode.D,
        up: Phaser.KeyCode.W,
        down: Phaser.KeyCode.S
    });

    this.keys.mute.onDown.add(function () {
       if (isMuted == false) {
           game.sound.mute = true;
           isMuted = true;
       }
        else {
           game.sound.mute = false;
           isMuted = false;
       }
    });


    this.keys.space.onDown.add(function () {
        if (this.marker.x >= 447 && this.marker.x <= 512 && this.isUnlocked == false) {
            this._showUnlocked();

            this.isUnlocked = true;

            this._changeToTerminal();
        }
    }, this);

    this.selectionIndex = 0;


    this.keys.enter.onDown.add(function () {
        if (this.currentScreen == null || this.currentScreen == this.overview) {
            this._showScreen(this.selectionIndex);
        }
    }, this);
    this.keys.back.onDown.add(function () {

        if(this.currentScreen == this.overview)
        {
            this._changeToGame();
        }
        else
        {
            this._showOverview(this.selectionIndex);
            this.selectionIndex = 0;
        }

    }, this);

    this.pickupCount = 0;
    this.hasKey = false;
    this.isTerminalOpen = false;
    this.isUnlocked = false;
    this.hasMaxPickups = false;
    this.terminalComplete = false;
    this.terminalUnlocked = false;
    var isMuted = false;

    this.isTutorialOpen = false;

    this.keys.tut.onDown.add(function () {
        if (this.isTutorialOpen == false) {
            this.tutorial = game.add.image(0,0, 'tutorialbg');
            this.isTutorialOpen = true;
        }
        else {
            this.tutorial.destroy();
            this.isTutorialOpen = false;
        }

    }, this);


};

PlayState._changeToTerminal = function()
{

    this.wasd.up.onDown.removeAll();
    this.keys.space.onDown.removeAll();
    this.keys.up.onDown.removeAll();
    this.keys.down.onDown.removeAll();

    this.wasd.up.onDown.add(function () {
        this._shiftUp(this.selectionIndex);
    }, this);

    this.wasd.down.onDown.add(function () {
        this._shiftDown(this.selectionIndex);
    }, this);

    this.keys.space.onDown.add(function () {
        this._shiftDown(this.selectionIndex);
    }, this);

    this.keys.up.onDown.add(function () {
        this._shiftUp(this.selectionIndex);
    }, this);
    this.keys.down.onDown.add(function () {
        this._shiftDown(this.selectionIndex);
    }, this);
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();

    this.pickupFont.text = `x${this.pickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;

};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    this.game.physics.arcade.collide(this.hero, this.keydoor);

    this.game.physics.arcade.overlap(this.hero, this.pickup, this._onHeroVsPickup,
        null, this);

    this.game.physics.arcade.collide(this.robots, this.platforms);
    this.game.physics.arcade.collide(this.robots, this.enemyWalls);

    this.game.physics.arcade.overlap(this.hero, this.robots,
        this._onHeroVsEnemy, null, this);

    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
        null, this);

    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
};

PlayState._onHeroVsPickup = function (hero, pickup) {
    pickup.kill();
    this.sfx.pickup.play();

    this.pickupCount++;
    this.terminal.frame++;

    this.game.add.tween(this.terminal.scale)
        .to({x: 1.2, y: 1.2}, 50, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .start();

    if (this.terminal.frame >= 10) {
        this.terminal.animations.add('spark', [10,11], 6, true);
        this.terminal.animations.play('spark');
    }

    if (this.pickupCount >= 10) {
        this.hasMaxPickups = true;
    }
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.bounce();
        this.sfx.stomp.play();

        enemy.die();
    }
    else { // game over -> restart the game
        hero.die();
        this.sfx.stomp.play();
        hero.events.onKilled.addOnce(function () {
            this.game.state.start("GameOver");
        }, this);
    }
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};

PlayState._onHeroVsDoor = function (hero, door) {
    door.frame = 1;
    this.sfx.door.play();

    hero.freeze();
    this.game.add.tween(hero)
        .to({x: this.door.x, alpha:0}, 500, null, true)
        .onComplete.addOnce(this._goToNextLevel, this);
};

PlayState._goToNextLevel = function () {
    this.camera.fade('#000000');
    this.camera.onFadeComplete.addOnce(function () {
        // change to next level
        this.game.state.start("Win")
    }, this);
};

PlayState._handleInput = function () {
    if (this.wasd.left.isDown || this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.wasd.right.isDown || this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }
    this.wasd.up.onDown.add(function () {
        let didJump = this.hero.jump();
        if (didJump) {
            this.sfx.jump.play();
        }
    }, this);

    this.keys.up.onDown.add(function () {
        let didJump = this.hero.jump();
        if (didJump) {
            this.sfx.jump.play();
        }
    }, this);

    if (this.pickupCount >= 10 && this.hasMaxPickups == true) {
        if (this.game.physics.arcade.distanceBetween(this.hero, this.terminal) <= 50 && this.isTerminalOpen == false && this.terminalComplete == false) {
            this.keys.interact.onDown.add(function () {
                this.hero.freeze();
                this.terminalBg = this.game.add.image(0, 0, 'terminal');
                this._terminalLock();
            }, this);
            this.isTerminalOpen = true;
        }
    }
};

PlayState._terminalLock = function () {
    if (this.terminalUnlocked == false) {
        this.metronomeBg = this.game.add.image(0,0, 'metronomebg');
        this.marker = this.game.add.image(470, 287, 'metronomemarker');

        this.marker.anchor.set(0.5,0.5);
        this.marker.x = 274;
        this.game.add.tween(this.marker)
            .to({x: this.marker.x + 410}, 2000, Phaser.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .loop()
            .start();
    }
    else {
        this._changeToTerminal();
        this._showOverview();
    }
};

PlayState._showUnlocked = function () {
    this.metronomeBg.destroy();
    this.marker.destroy();

    this.unlocked = this.game.add.image(0,0, 'unlocked');

    this.game.time.events.add(Phaser.Timer.SECOND * 2, this._showOverview, this);

    this.terminalUnlocked = true;

};
PlayState._showOverview = function () {
    if (this.unlocked != null) {
        this.unlocked.destroy();
    }
    if (this.currentScreen != null) {
        this.currentScreen.destroy();
    }
    if (this.currentScreen == this.overview && this.currentScreen != null) {
        this.overview.destroy();
        this.selection.destroy();
    }

    this.selectionPosition = 170;
    this.overview = this.game.add.image(0,0, 'overview');
    this.selection = this.game.add.image(257, 170, 'selection');
    this.currentScreen = this.overview;

};

PlayState._shiftUp = function () {
    this.selectionIndex--;
    if (this.selectionIndex < 0) {
        this.selectionIndex = 0;
    }

    this.game.selectionPosition = 170 + 25 * this.selectionIndex;

    this.game.add.tween(this.selection)
        .to({y: this.game.selectionPosition}, 100)
        .start();


};
PlayState._shiftDown = function () {
    this.selectionIndex++;
    if (this.selectionIndex >= 7) {
        this.selectionIndex = 0;
    }

    this.game.selectionPosition = 170 + 25 * this.selectionIndex;
    this.game.add.tween(this.selection)
        .to({y: this.game.selectionPosition}, 100)
        .start();

};

PlayState._showScreen = function (selectionIndex) {

    this.overview.destroy();
    this.selection.destroy();

    switch (selectionIndex) {
        case 0: this.screen00 = this.game.add.image(0,0, 'screen01');
                this.currentScreen = this.screen00;
            break;
        case 1: this.screen01 = this.game.add.image(0,0, 'screen02');
                this.currentScreen = this.screen01;
            break;
        case 2: this.screen02 = this.game.add.image(0,0,'screen03');
                this.currentScreen = this.screen02;
            break;
        case 3: this.screen03 = this.game.add.image(0,0,'screen04');
                this.currentScreen = this.screen03;
            break;
        case 4: this.screen04 = this.game.add.image(0,0,'screen05');
                this.currentScreen = this.screen04;
            break;
        case 5: this.screen05 = this.game.add.image(0,0,'screen06');
                this.currentScreen = this.screen05;
            break;
        case 6: this.terminalComplete = true;
              this._changeToGame();
            break;
    }
};


PlayState._changeToGame = function()
{
    this.marker.destroy();
    this.metronomeBg.destroy();
    this.terminalBg.destroy();
    this.currentScreen.destroy();
    if (this.selection != null) {
        this.selection.destroy();
    }
    this.hero.unfreeze();

    if(this.terminalComplete == true)
    {
        this._lowerKeyDoor();
    }

    this.wasd.up.onDown.removeAll();
    this.wasd.down.onDown.removeAll();

    this.keys.space.onDown.removeAll();
    this.keys.up.onDown.removeAll();
    this.keys.down.onDown.removeAll();


};

PlayState._lowerKeyDoor = function () {
    this.game.add.tween(this.keydoor)
        .to({y: 557}, 2000)
        .start();
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.pickupFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR, 6);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);

     let pickupIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:pickup');

    let pickupScoreImg = this.game.make.image(pickupIcon.x + pickupIcon.width,
        pickupIcon.height / 2, this.pickupFont);
    pickupScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(pickupIcon);
    this.hud.position.set(10, 10);
    this.hud.add(pickupScoreImg);
    this.hud.add(this.keyIcon);

};


window.onload = function () {
    game.state.add('play', PlayState);
    game.state.start('play');
};

