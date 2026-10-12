function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(data) {
		var tryHeaderHeight = 40;
		if(data.comment) { 
			tryHeaderHeight += 40;
		}
		return tryHeaderHeight;
	});
}
