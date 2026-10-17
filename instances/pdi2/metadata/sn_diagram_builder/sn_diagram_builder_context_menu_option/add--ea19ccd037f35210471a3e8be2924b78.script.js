function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
    //Add code for click of this context menu option
    //Add node to the diagram only from Palette component
    if (!diagram.model.isReadOnly && diagram.model.modelData._isPaletteNode) {
        dispatch("GO_DIAGRAM#ADD_NODE_BY_ACTION_ID", {
            actionId: node.data.actionId,
            positionProps: {
                relativeTo: "selectedNode",
                spot: "right",
                padding: 10,
                width: 80,
                height: 80
            }
        });
    }
}
