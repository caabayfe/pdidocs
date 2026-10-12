function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
    var currentlySelectedNode = diagram.selection.first();
    if (
        !currentlySelectedNode ||
        (currentlySelectedNode &&
            currentlySelectedNode.data.key !== node.data.key)
    ) {
        // When no node is currently selected or selected node and the one for which context menu option "View" is clicked are different,
        // select the node so that right panel refreshes to show appropriate node's data.
        diagram.select(node);
        //Remove any focus on interactiveGraphObject like contextmenu
        diagram.model.commit(model => {
            model.setDataProperty(node.part.data, 'currentFocusOn', '');
        }, 'removing currentFocusOn property of part');
    } else {
        // If the View option is clicked for an already selected node, no need to select that node.
        // In this case ensure that right panel is expanded.
        dispatch(
            "RIGHT_PANEL#RIGHT_PANEL_COLLAPSED", {
                collapsed: false
            }
        );
    }
}
