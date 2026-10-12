function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var linkST = obj.part.findObject('linkST');
        if (linkST) {
            linkST.stroke = resolveThemeVariable('--now-color_border--tertiary');
        }
    };
}
