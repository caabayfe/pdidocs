function getBinding(go, source, target) {
	return new go.Binding(target, source, function(direction){
		return direction === "rtl" ? new go.Margin(0, 0, 0, 5) : new go.Margin(0, 5, 0, 0);
	}).ofModel();
}
