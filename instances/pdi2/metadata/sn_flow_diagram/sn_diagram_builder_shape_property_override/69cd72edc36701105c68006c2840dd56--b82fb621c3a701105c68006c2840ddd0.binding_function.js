function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(graphObject) {
		if (graphObject.data.data.isDurationBold) {
			return '600 16px "Open Sans", sans-serif';
		} else {
			return '400 16px "Open Sans", sans-serif';
		}
	}).ofObject();
}
