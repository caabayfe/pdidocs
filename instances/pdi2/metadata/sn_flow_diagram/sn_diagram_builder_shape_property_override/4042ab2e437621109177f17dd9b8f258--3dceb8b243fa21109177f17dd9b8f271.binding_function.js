function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(graphObject) {
		if(graphObject.data && graphObject.data.data && graphObject.data.data.conditionDisplay) {
			return graphObject.data.data.conditionDisplay;
		}

		return "";
    }).ofObject();
}
