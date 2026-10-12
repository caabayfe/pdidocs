function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
		if((data.commentsEnabled && data.comment) || data.onAddAnnotation || (data.data && !!data.data.conditionDisplay)) {
			return false;
		}
		return true;
    });
}
