//Spaceship
function Spaceship(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spaceship');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.animations.add('stop', [0]);
    this.animations.add('fly', [1, 2], 8, true); // 8fps looped
    this.animations.play('stop');
}

Spaceship.prototype = Object.create(Phaser.Sprite.prototype);
Spaceship.prototype.constructor = Spaceship;

// Spaceship move
Spaceship.prototype.move = function (directionX, directionY) {
    if (this.isFrozen) { return; }

    const SPEED = 200;
    this.body.velocity.x = directionX * SPEED;
    this.body.velocity.y = -directionY * SPEED;

    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
        this.angle = 0;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
        this.angle = 0;
    }
    if (this.body.velocity.y < 0) {
        this.scale.x = -1;
        this.angle = 90;
    }
    else if (this.body.velocity.y > 0) {
        this.scale.x = 1;
        this.angle = 90;
    }
};

Spaceship.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};
Spaceship.prototype.unfreeze = function () {
    this.body.enable = true;
    this.isFrozen = false;
};

// Spaceship update
Spaceship.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Spaceship.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // frozen & not dying
    if (this.isFrozen) {
        name = 'stop';
    }
    else if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
        name = 'fly';
    }

    return name;
};

// =========================================================================================

MapState = {};

MapState.preload = function () {
    this.game.load.json('level:worldmap', 'data/worldmap.json');
    this.game.load.image('worldmap', 'images/worldmap.png');

    // Player
    this.game.load.spritesheet('spaceship', 'images/spaceship.png', 42, 42);

    // Stations
    this.game.load.image('1-1', 'images/1-1.png');
    this.game.load.image('station1-1', 'images/station1-1.png');
    this.game.load.image('1-2', 'images/1-2.png');
    this.game.load.image('station1-2', 'images/station1-2.png');
    this.game.load.image('1-3', 'images/1-3.png');
    this.game.load.image('station1-3', 'images/station1-3.png');
};

MapState.create = function () {
    this.game.add.image(0, 0, 'worldmap');
    this._loadMap(this.game.cache.getJSON('level:worldmap'));
};

MapState.init = function () {
    this.game.renderer.renderSession.roundPixels = true;

    this.wasd = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.A,
        right: Phaser.KeyCode.D,
        up: Phaser.KeyCode.W,
        down: Phaser.KeyCode.S,
        interact: Phaser.KeyCode.E,
        tut: Phaser.KeyCode.ESC,
        mute: Phaser.KeyCode.M
    });
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        down: Phaser.KeyCode.DOWN
    });

    this.isTutorialOpen = false;
    this.wasd.tut.onDown.add(function () {
        if (this.isTutorialOpen == false) {
            this.tutorial = game.add.image(0,0, 'tutorialbg');
            this.spaceship.freeze();
            this.isTutorialOpen = true;
        }
        else {
            this.tutorial.destroy();
            this.spaceship.unfreeze();
            this.isTutorialOpen = false;
        }
    }, this);

    this.wasd.mute.onDown.add(function () {
        if (isMuted == false) {
            game.sound.mute = true;
            isMuted = true;
        }
        else {
            game.sound.mute = false;
            isMuted = false;
        }
    });

    var isMuted = false;

};

MapState.update = function () {
    this._handleMapCollisions();
    this._handleInput();

};

MapState._handleInput = function () {
    if (this.wasd.left.isDown || this.keys.left.isDown) { // move left
        this.spaceship.move(-1, 0);
    }
    else if (this.wasd.right.isDown || this.keys.right.isDown) { // move right
        this.spaceship.move(1, 0);
    }
    else if (this.wasd.up.isDown || this.keys.up.isDown) {
        this.spaceship.move(0, 1);
    }
    else if (this.wasd.down.isDown || this.keys.down.isDown) {
        this.spaceship.move(0, -1);
    }
    else { // stop
        this.spaceship.move(0, 0);
    }
};

MapState._loadMap = function (data) {
    this.stations = this.game.add.group();

    this._spawnSpaceship();
    data.stations.forEach(this._spawnStation, this);

};

MapState._spawnSpaceship = function () {
    this.spaceship = new Spaceship(this.game, 10, 500);
    this.game.add.existing(this.spaceship);

};

MapState._spawnStation = function (station) {
    station = this.stations.create(
        station.x, station.y, station.image);

    this.game.physics.enable(station);
    station.body.allowGravity = false;
    station.body.immovable = true;
    station.anchor.set(0.5, 0.5);

    this.station = station;

    var ran = this.game.math.clamp(this.game.world.randomY, 330, 350);

    this.game.add.tween(station)
        .to({y: ran}, 2500, Phaser.Easing.Linear.InOut, true)
        .loop(true)
        .yoyo(true)
        .start();


};

var isFirstDisplayed = false;
var isSecondDisplayed = false;
var isThirdDisplayed = false;

MapState._handleMapCollisions = function () {
    var spaceship = this.spaceship;
    this.stations.forEach(function (station) {
        if (this.game.physics.arcade.distanceBetween(spaceship, station) <= 75) {
            switch (station.key) {
                case '1-1':
                    if (isFirstDisplayed === false) {
                        MapState._showFirst(station);
                        isFirstDisplayed = true;
                    }
                    break;
                case '1-2':
                    if (isSecondDisplayed === false) {
                        MapState._showSecond(station);
                        isSecondDisplayed = true;
                    }
                    break;
                case '1-3':
                    if (isThirdDisplayed === false) {
                        MapState._showThird(station);
                        isThirdDisplayed = true;
                    }
                    break;
                }
            }
            else {
            switch (station.key) {
                case '1-1':
                    if (isFirstDisplayed === true) {
                        this.game.station1.destroy();
                        MapState._removeAllInteractions();
                        isFirstDisplayed = false;
                    }
                    break;
                case '1-2':
                    if (isSecondDisplayed === true) {
                        this.game.station2.destroy();
                        MapState._removeAllInteractions();
                        isSecondDisplayed = false;
                    }
                    break;
                case '1-3':
                    if (isThirdDisplayed === true) {
                        this.game.station3.destroy();
                        isThirdDisplayed = false;
                    }
                    break;
            }
        }
    });
};
MapState._showFirst = function (station) {
    this.game.station1 = game.add.image(station.x, station.y, 'station1-1');
    this.game.station1.anchor.set(0,1);
    this.wasd.interact.onDown.add(function () {
        window.open("http://scratch.starfeesh.com/laserdefender/", "_blank");
    });
};
MapState._showSecond = function (station) {
    this.game.station2 = game.add.image(station.x, station.y, 'station1-2');
    this.game.station2.anchor.set(0.5,1);
    this.wasd.interact.onDown.add(function () {
        window.open("http://kea.starfeesh.com/fairtrade/dv/index.html", "_blank");
    });
};
MapState._showThird = function (station) {
    this.game.station3 = game.add.image(station.x, station.y, 'station1-3');
    this.game.station3.anchor.set(1,1);
    this.wasd.interact.onDown.add(function () {
        game.state.start("Game");
    });
};

MapState._removeAllInteractions = function () {
    this.wasd.interact.onDown.removeAll();
};

window.onload = function () {
    game.state.add('map', MapState);
    game.state.start('map');
};

