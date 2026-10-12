function showMenuOption(diagram, node, actionPropertyMap) {
	//Add code to control visibility of this option
    if (node.data.isActionSystemLevel) {
        return false;
    }
    if (node.data.instanceType == "ActionInstanceType") {
        return true;
    }
    return false;
}
