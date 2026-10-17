function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(graphObject) {
		if (graphObject.data.data.stageDurationLabel) {
			return graphObject.data.data.stageDurationLabel;
		} else {
			return '';
		}
	}).ofObject();
}
