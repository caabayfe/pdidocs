function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(graphObject) {
		// Only give error stage longer text since those don't show duration label
		if (graphObject.data.data.isErrorStage) {
			return 300;
		} else {
			return '';
		}
	}).ofObject();
}
