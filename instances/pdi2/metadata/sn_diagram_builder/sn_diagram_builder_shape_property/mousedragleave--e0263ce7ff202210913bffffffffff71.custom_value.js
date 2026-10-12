function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var rectST = obj.part.findObject('rectST');
        if (rectST && !e.diagram.model.modelData._isPaletteNode) {
            rectST.fill = resolveThemeVariable('--now-color_background--primary');
        }
    };
}
