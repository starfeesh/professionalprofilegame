var utils = {
    centerGameObjects: function (objects) {
        objects.forEach(function (object) {
            object.anchor.setTo(0.5);
        })
    }
};

var Splash = function () {},
    playSound = true,
    playMusic = true,
    music;

Splash.prototype = {

    loadScripts: function () {
        game.load.script('webfont', 'util/webfontloader.js');
        game.load.script('gamemenu','js/gamemenu.js');
        game.load.script('tutorial', 'js/tutorial.js');
        game.load.script('worldmap', 'js/worldmap.js');
        game.load.script('thegame', 'js/game.js');
        game.load.script('gameover','js/gameover.js');
        game.load.script('win', 'js/win.js');
        game.load.script('style', 'css/style.js');
    },

    loadBgm: function () {
        // thanks Visager at http://freemusicarchive.org/music/Visager/Songs_From_An_Unmade_World_2/
        game.load.audio('windy', 'audio/Visager_-_14_-_Windy_Bluffs_Loop.mp3');
    },

    loadImages: function () {
        game.load.image('splashbg', 'images/splash.png');
        game.load.image('tutorialbg', 'images/tutorial.png');
        game.load.image('gameoverbg', 'images/gameover.png');
        game.load.image('winscreen', 'images/win.png');
    },

    loadFonts: function () {
        WebFontConfig = {
            custom: {
                families: ['OCRAStd'],
                urls: ['css/myfont.css']
            }
        }
    },

    init: function () {

    },

    preload: function () {
        this.loadScripts();
        this.loadImages();
        this.loadBgm();
        this.loadFonts();

    },

    addGameStates: function () {

        game.state.add("GameMenu",MenuState);
        game.state.add("Tutorial", TutorialState);
        game.state.add("WorldMap", MapState);
        game.state.add("Game",PlayState);
        game.state.add("GameOver",LoseState);
        game.state.add("Win",WinState);
    },

    addGameMusic: function () {
        music = game.add.audio('windy');
        music.loop = true;
        music.volume = 0.3;
        music.play();
    },


    create: function() {
        this.addGameStates();
        this.addGameMusic();
        this.game.add.image(0, 0, 'splashbg');

        setTimeout(function () {
            game.state.start("GameMenu");
        }, 2000);
    }
};

