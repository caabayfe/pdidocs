function getBinding(go, source, target, dispatch, resolveThemeVariable) {
	return new go.Binding(target, source, function(iconBackground) {
		if (!iconBackground) {
			return resolveThemeVariable('--now-color_brand--primary') || "#032D42";
		// If the color is a hexcode, use it
		} else if (iconBackground[0] === '#'){
			return iconBackground;
		// else the color will a theme variable
		} else {
			return resolveThemeVariable(iconBackground);
		}
	});
}
