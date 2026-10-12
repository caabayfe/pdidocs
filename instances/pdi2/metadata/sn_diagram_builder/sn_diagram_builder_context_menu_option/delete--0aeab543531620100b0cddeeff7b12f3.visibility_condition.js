function showMenuOption(diagram, node, actionPropertyMap) {
    //Hide this option from Palette nodes
    if (diagram.model.modelData._isPaletteNode) return false;
    //Delete option is shown on Switch node alone in read only mode to demonstrate how disable condition works.
	if (node.data.key == 'f1c3329b53103110de44ddeeff7b1263')
        return true;
	// Show delete option only when diagram is editable and current node can be deleted.
    if (node) {
        var nodeType = actionPropertyMap[
            node.data.node_id
        ].nodeType;
        return nodeType.allowDelete && !diagram.model.isReadOnly;
    }
    return !diagram.model.isReadOnly;
}
