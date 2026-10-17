function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(h) { return h ? new go.Spot(0, 0.5, 132, 0) : new go.Spot(0, 0.5, 120, 0); }).ofObject();
}
