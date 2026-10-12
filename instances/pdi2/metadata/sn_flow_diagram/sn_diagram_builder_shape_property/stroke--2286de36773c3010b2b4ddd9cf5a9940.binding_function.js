function getBinding(go, source, target, dispatch, resolveThemeVariable) {
	return new go.Binding(target, source, function(iconBackground) {
		if (!iconBackground)
			return resolveThemeVariable('--now-color_brand--primary') || "#032D42";
		return iconBackground;
	});
}
