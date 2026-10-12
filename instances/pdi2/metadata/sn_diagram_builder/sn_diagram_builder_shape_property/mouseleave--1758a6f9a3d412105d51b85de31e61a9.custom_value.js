function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj) {
        var linkST = obj.part.findObject('linkST');
        if (linkST) {
            linkST.stroke = resolveThemeVariable("--now-color_border--tertiary");
        }
    };
}
