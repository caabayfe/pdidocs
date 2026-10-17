function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var diamondST = obj.part.findObject('diamondST');
        if (diamondST) {
            diamondST.stroke = resolveThemeVariable("--now-color--primary-1");
            diamondST.strokeWidth = 2;
        }
    };
}
