function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var rectST = obj.part.findObject('rectangleST');
        if (rectST && !e.diagram.model.modelData._isPaletteNode) {
            rectST.fill = 'white';
        }
    };
}
