function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(graphObject) {
		if (graphObject.data.data.stageLabel) {
			return graphObject.data.data.stageLabel;
		} else {
			return 'No Data';
		}
	}).ofObject();
}
