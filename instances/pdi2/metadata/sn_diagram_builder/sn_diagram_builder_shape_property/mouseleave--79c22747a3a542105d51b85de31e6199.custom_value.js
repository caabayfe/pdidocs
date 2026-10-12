function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var diamondST = obj.part.findObject('diamondST');
        if (diamondST) {
            diamondST.stroke = resolveThemeVariable("--now-datavis_color--blue-7");
			      diamondST.strokeWidth = 1;
        }
    };
}
