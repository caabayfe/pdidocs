function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
    dispatch("GO_DIAGRAM#DIAGRAM_SAFE_DELETE_NODE_REQUESTED", {
        data: node.data
    });
}
