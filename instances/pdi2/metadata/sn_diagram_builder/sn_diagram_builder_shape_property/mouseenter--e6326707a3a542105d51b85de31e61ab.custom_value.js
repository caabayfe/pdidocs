function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var circleST = obj.part.findObject('circleST');
        if (circleST) {
            circleST.stroke = resolveThemeVariable("--now-color--primary-1");
            circleST.strokeWidth = 2;
        }
    };
}
