function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, part) {
        const modelData = e.diagram.model.modelData;
        if (modelData._isPaletteNode && !modelData._isReadOnly) {
            dispatch("GO_DIAGRAM#ADD_NODE_BY_ACTION_ID", {
                actionId: part.data.actionId,
                positionProps: {
                    relativeTo: "selectedNode",
                    spot: "right",
                    padding: 10,
                    width: 80,
                    height: 80
                }
            });
        }
    };
}
