function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(graphObject) {
        var shapeHeight = 52;
        var commentHeight = 40;

        if (graphObject.data.commentsEnabled && (graphObject.data.comment && graphObject.data.comment != "" || graphObject.data.onAddAnnotation)) {
            shapeHeight += commentHeight;
        }

        return shapeHeight;
    }).ofObject();
}
