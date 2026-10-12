function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
    dispatch("GO_DIAGRAM#DUPLICATE_NODE_REQUESTED", { key: node.data.key});
}
