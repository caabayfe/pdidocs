function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
		var shapeHeight = 0;
		var natLangHeight = 30;

		if(data.data && data.data.conditionDisplay) {
			var display = data.data.conditionDisplay;
			if(display.length < 45){
				return natLangHeight - 10;
			}
			return natLangHeight;
		}
		
		return shapeHeight;
    });
}
