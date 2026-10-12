function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(graphObject, node) {
        var shapeHeight = 0;
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
        var hasComment = graphObject.data && graphObject.data.commentsEnabled && graphObject.data.comment && graphObject.data.comment != "";
        var addingComment = graphObject.data && graphObject.data.onAddAnnotation && !graphObject.data.comment;

        if (addingComment) {
            var textBlock = node.findObject("AnnotationTextBlock");
            graphObject.diagram.commandHandler.editTextBlock(textBlock);
            shapeHeight += commentHeight;
            if (hasCondition) {
                shapeHeight -= 5;
            }
        } else if (hasComment) {
            shapeHeight += commentHeight;
            if (hasCondition) {
                shapeHeight -= 5;
            }
        }

        return shapeHeight;
    }).ofObject();
}
