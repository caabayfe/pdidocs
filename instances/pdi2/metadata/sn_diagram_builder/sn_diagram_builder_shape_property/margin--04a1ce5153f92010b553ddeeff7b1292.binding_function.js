function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(h) { return h ? 5 : 5; }).ofObject();
}
