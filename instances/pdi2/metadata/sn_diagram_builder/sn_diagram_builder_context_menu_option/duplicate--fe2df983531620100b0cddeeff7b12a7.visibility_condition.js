function showMenuOption(diagram, node, actionPropertyMap) {
    //Duplicate option is shown on Switch node alone in read only mode to demonstrate how disable condition works.
    //Hide this option from Palette nodes
    if (diagram.model.modelData._isPaletteNode) return false;
    if (node.data.key == 'f1c3329b53103110de44ddeeff7b1263')
        return true;
    return !diagram.model.isReadOnly;
}
