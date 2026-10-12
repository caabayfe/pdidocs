function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
	var themeVariable = resolveThemeVariable("--now-color_background--primary");
	return themeVariable ? themeVariable : resolveThemeVariable("--now-color_background--primary");
}
