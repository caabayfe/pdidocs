function getValue(go, source, target) {
	return new go.Binding(source, target, function(v) { return v;}).ofObject();
}
