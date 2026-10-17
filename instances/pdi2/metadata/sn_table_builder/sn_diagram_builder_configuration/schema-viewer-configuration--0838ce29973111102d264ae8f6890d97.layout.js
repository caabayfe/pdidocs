function getLayout($, go) {
    var ANGLE = 90;
    var NODE_SPACING = 100;
    var LAYER_SPACING = 120;
    var ALTERNATE_ANGLE = 0;

    return $(go.TreeLayout, {
        angle: ANGLE,
        nodeSpacing: NODE_SPACING,
        layerSpacing: LAYER_SPACING,
        alternateAngle: ALTERNATE_ANGLE,
        setsChildPortSpot: false,
        setsPortSpot: false,
        isInitial: true
    });
}
