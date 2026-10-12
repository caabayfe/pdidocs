function  getBinding(go, source, target, dispatch, resolveThemeVariable) {
	return new go.Binding(target, "", function(graphObject) {
		if (graphObject.data.data.isErrorStage) {
			return resolveThemeVariable("--now-color_alert--critical-0") || "#F8C8CD";
		} else {
			return resolveThemeVariable("--now-color_grouped--yellow-0") || "#FFF1D4";
		}
	}).ofObject();
	
	
}
