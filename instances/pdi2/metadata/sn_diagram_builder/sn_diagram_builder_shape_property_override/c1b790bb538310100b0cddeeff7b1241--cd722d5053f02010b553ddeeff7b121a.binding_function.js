function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(h) { return h ? 1 : 1; }).ofObject();
}
