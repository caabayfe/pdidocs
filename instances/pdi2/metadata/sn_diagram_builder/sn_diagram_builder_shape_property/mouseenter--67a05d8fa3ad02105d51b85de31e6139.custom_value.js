function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var rectST = obj.part.findObject('rectangleST');
        if (rectST) {
            rectST.stroke = resolveThemeVariable("--now-color--primary-1");
            rectST.strokeWidth = 2;
        }
    };
}
