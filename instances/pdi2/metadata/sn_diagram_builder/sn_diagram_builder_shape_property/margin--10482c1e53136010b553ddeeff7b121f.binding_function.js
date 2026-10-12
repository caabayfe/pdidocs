function getBinding(go, source, target) {
	return new go.Binding(target, source, function(direction){
		return direction === "rtl" ? new go.Margin(0, 10, 0, 0) : new go.Margin(0, 0, 0, 10);
	}).ofModel();
}
