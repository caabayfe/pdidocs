function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(graphObject) {
		if(graphObject.data && graphObject.data.instanceType === "FlowLogicInstanceType") {
			return new go.Margin(0, 10, 0, 0);
		}

		return new go.Margin(0, 0, 0, 0);
    }).ofObject();
}
