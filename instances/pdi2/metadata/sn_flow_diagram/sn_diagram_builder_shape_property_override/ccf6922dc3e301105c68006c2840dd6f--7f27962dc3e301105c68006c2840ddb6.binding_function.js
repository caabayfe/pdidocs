function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(graphObject) {
		if (graphObject.data.data.isErrorStage) {
			return '/images/stage-error-icon.svg';
		} else {
			return '/images/stage-flag-icon.svg';
		}
	}).ofObject();
}
