var TutorialState = function() {};

TutorialState.prototype = {
    startGame: function(text, callback) {
        var txt = game.add.text(0, 420, text, style.navitem.default);
        txt.setTextBounds(0, 50, 960, 0);
        txt.inputEnabled = true;
        txt.events.onInputUp.add(callback);
        txt.events.onInputOver.add(function (target) {
            target.setStyle(style.navitem.hover);
        });
        txt.events.onInputOut.add(function (target) {
            target.setStyle(style.navitem.default);
        });
    },

    create: function () {
        game.add.image(0,0, 'tutorialbg');

        this.startGame('Play!', function () {
            game.state.start("WorldMap");
        });
    }
};
