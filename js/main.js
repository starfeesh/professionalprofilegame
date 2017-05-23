var game = new Phaser.Game(960, 600, Phaser.AUTO, 'game'), Main = function () {};

Main.prototype = {

    preload: function () {
        game.load.image('stars',    'images/background.png');
        game.load.script('splash',  'js/splash.js');
    },

    create: function () {
        game.state.add('Splash', Splash);
        game.state.start('Splash');
    }

};

game.state.add('Main', Main);
game.state.start('Main');