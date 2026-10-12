function showMenuOption(diagram, node, actionPropertyMap) {
    //Add is visible only for the nodes inside Palette
    return diagram.model.modelData._isPaletteNode;
}
