var LoseState = function() {};

LoseState.prototype = {

    addMenuOption: function(text, callback) {
        var txt = game.add.text(0, (this.optionCount * 80), text, style.navitem.default);
        txt.setTextBounds(0, 200, 960, 0);
        txt.inputEnabled = true;
        txt.events.onInputUp.add(callback);
        txt.events.onInputOver.add(function (target) {
            target.setStyle(style.navitem.hover);
        });
        txt.events.onInputOut.add(function (target) {
            target.setStyle(style.navitem.default);
        });
        this.optionCount ++;
    },

    init: function () {
        this.optionCount = 1;
    },

    create: function () {
        game.stage.disableVisibilityChange = false;

        game.add.image(0, 0, 'gameoverbg');

        this.addMenuOption('Restart', function () {
            game.state.start("Game");
        });
        this.addMenuOption('Skip Game', function () {
            window.open('http://kea.starfeesh.com/professionalprofile/', '_blank')
        });
    }
};