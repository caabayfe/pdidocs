function showMenuOption(diagram, node, actionPropertyMap) {
	//Add code for click of this context menu option
    //Hide this option from Palette nodes
    if (diagram.model.modelData._isPaletteNode) return false;
	return true;
}
