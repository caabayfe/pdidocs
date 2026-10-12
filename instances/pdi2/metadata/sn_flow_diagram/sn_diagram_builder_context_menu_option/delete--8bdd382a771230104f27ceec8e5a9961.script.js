function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
    dispatch("DIAGRAM_CONTEXT#DELETE_FLOW_NODE", {
        data: node.data
    });
}
