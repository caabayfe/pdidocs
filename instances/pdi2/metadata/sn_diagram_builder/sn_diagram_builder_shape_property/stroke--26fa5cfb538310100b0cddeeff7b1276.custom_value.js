function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    var themeVariable = resolveThemeVariable("--now-color--neutral-1");
    return themeVariable ? themeVariable : "#f4f7f8";
}
