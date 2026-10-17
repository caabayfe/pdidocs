function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    var themeVariable = resolveThemeVariable("--now-color--neutral-0");
    return themeVariable ? themeVariable : resolveThemeVariable('--now-color_background--primary');
}
