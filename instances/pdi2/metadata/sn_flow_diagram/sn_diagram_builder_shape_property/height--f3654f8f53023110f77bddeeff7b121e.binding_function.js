function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
		var shapeHeight = 0;
		var natLangHeight = 56;

		if(data.comment || (data.data && data.data.conditionDisplay)) {
			return natLangHeight;
		}
		return shapeHeight;
    });
}
