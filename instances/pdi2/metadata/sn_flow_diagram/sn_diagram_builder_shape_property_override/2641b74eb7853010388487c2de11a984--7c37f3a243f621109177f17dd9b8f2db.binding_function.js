function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(graphObject) {
        var shapeHeight = 52;
        var commentHeight = 40;
        var natLangHeight = 45;
        var hasCondition = graphObject.data && graphObject.data.data && graphObject.data.data.conditionDisplay;

        if (hasCondition) {
            var display = graphObject.data.data.conditionDisplay;
            if (display.length < 45) {
                shapeHeight += natLangHeight - 10;
            } else {
                shapeHeight += natLangHeight;
            }
        }

        if (graphObject.data.commentsEnabled && (graphObject.data.comment && graphObject.data.comment != "" || graphObject.data.onAddAnnotation)) {
            shapeHeight += commentHeight;
            if (hasCondition) {
                shapeHeight -= 5;
			}
        }

        return shapeHeight;
    }).ofObject();
}
