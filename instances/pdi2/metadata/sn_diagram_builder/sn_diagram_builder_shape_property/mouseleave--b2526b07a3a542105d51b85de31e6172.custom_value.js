function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var circleST = obj.part.findObject('circleST');
        if (circleST) {
            circleST.stroke = resolveThemeVariable("--now-datavis_color--blue-7");;
            circleST.strokeWidth = 1;
        }
    };
}
