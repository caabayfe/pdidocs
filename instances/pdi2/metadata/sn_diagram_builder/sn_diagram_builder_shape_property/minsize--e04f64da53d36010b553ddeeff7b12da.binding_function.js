function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(exp) { return exp ? new go.Size(NaN, NaN) : new go.Size(185, NaN); }).ofObject();
}
