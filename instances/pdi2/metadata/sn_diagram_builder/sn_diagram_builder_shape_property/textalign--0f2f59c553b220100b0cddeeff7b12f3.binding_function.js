function getBinding(go, source, target) {
	return new go.Binding(target, source, function(direction){
		return direction === "rtl"? "right": "left";
	}).ofModel();
}
