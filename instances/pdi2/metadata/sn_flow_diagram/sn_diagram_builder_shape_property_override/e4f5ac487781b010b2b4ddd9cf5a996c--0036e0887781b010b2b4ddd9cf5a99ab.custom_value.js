function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    var themeVariable = resolveThemeVariable("--now-color_text--primary");
    return themeVariable ? themeVariable : "#10171B";
}
