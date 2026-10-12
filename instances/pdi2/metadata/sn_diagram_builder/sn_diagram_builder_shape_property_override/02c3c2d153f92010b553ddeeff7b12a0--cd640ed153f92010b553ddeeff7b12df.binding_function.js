function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(exp) { return exp ? "Hide" : "Show"; }).ofObject();
}
