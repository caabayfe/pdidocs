function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(h) { return h ? new go.Margin(5, 0, 5, 5) : 0; }).ofObject();
}
