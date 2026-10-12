function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(h) { return h ? go.Spot.Center : go.Spot.Center; }).ofObject();
}
