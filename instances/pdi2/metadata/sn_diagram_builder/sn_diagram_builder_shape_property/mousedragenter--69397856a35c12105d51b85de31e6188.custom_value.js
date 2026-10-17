function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var circleST = obj.part.findObject('circleST');
        if (circleST && !e.diagram.model.modelData._isPaletteNode) {
            circleST.fill = 'lime';
        }
    };
}
