function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var diamondST = obj.part.findObject('diamondST');
        if (diamondST && !e.diagram.model.modelData._isPaletteNode) {
            diamondST.fill = 'lime';
        }
    };
}
