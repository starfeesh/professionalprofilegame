var style;

// this is a wrapped function
(function () {

    // the variables declared here will not be scoped anywhere and will only be accessible in this wrapped function
    var defaultColor = "white",
        highlightColor = "#61D0F7";

    style = {
        navitem: {
            base: {
                font: '24pt OCRAStd',
                boundsAlignH: 'center'

            },
            default: {
                fill: defaultColor
            },
            hover: {
                fill: highlightColor
            }
        }
    };

    Object.assign(style.navitem.hover, style.navitem.base);
    Object.assign(style.navitem.default, style.navitem.base);

})();