function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(event, buttonObject) {
        if (!event.diagram.model.modelData._isPaletteNode) {
            var node = buttonObject.part;
            dispatch("GO_DIAGRAM#REPLACE_NODE_CLICKED", {
                key: node.data.key,
                group: node.data.group
            });
        }
        event.handled = true;
    };
}
