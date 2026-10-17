function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var rectST = obj.part.findObject('rectangleST');
        if (rectST) {
            rectST.stroke = resolveThemeVariable("--now-datavis_color--blue-7");;
            rectST.strokeWidth = 1;
        }
    };
}
