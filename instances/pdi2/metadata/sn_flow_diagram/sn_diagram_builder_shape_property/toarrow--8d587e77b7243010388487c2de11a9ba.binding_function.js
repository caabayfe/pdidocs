function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "hideToArrow", function(hideToArrow) { if (hideToArrow) { return ""; } return "FlowArrow"; });
}
