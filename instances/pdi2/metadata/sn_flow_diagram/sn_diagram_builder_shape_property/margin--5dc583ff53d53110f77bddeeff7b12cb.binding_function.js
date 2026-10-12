function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
        if (data.onAddAnnotation || data.comment) {
			if (data.name.length < 20) {
				return new go.Margin(15, 0, 0, 0);
			}
            return new go.Margin(5, 0, 0, 0);
        }
    });
}
