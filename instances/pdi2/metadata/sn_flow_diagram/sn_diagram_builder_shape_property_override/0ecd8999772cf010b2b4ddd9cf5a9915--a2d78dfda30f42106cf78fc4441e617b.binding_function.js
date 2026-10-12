function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, "", function(graphObject) {
		if(graphObject.data.showContextMenu) {
			return "pointer";
		}else {
			return "default";
		}
    }).ofObject();
}
