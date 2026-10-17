function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    var themeVariable = resolveThemeVariable("--now-datavis_color--blue-7");
    return themeVariable ? themeVariable : "#00899f";
}
