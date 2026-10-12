function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
		var commentHeight = 30;

		if (graphObject.data.commentsEnabled && (data.comment && data.comment !== "" || data.onAddAnnotation)) {
            return commentHeight;
        }
		
		return 0;
    });
}
