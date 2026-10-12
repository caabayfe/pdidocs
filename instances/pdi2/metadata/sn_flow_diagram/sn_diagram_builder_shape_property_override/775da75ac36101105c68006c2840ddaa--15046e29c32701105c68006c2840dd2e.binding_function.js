function  getBinding(go, source, target, dispatch, resolveThemeVariable) {
	return new go.Binding(target, "", function(graphObject) {
		if (graphObject.data.data.isErrorStage) {
			return resolveThemeVariable("--now-color_alert--critical-1") || "#EE7482";
		} else if (graphObject.isSelected || graphObject.isHighlighted || graphObject.data.isSelected) {
			return resolveThemeVariable("--now-color--focus-2") || "#4C6CEB";
		} else {
			return resolveThemeVariable("--now-color_grouped--yellow-1") || "#F5E09B";
		}
	}).ofObject();
}
