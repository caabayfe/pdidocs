function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj) {
        const themeColor = resolveThemeVariable("--now-color_background--secondary-actionable", false);
        const themeColorWithOpacity = "rgba(" + themeColor + ",0.25)";
        obj.background = themeColorWithOpacity;
    };
}
