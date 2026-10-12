function getBinding(go, source, target) {
	return new go.Binding(target, source, function(v) { return v;}).ofObject();
}
