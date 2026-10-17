function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var rectST = obj.part.findObject('groupPlaceholder');
        if (rectST) {
            rectST.fill = resolveThemeVariable("--now-color_background--secondary");
        }
    };
}
