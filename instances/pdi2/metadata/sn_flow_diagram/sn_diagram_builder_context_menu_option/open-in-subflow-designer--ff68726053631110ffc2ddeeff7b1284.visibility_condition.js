function showMenuOption(diagram, node, actionPropertyMap) {
	if (node.data.instanceType == "SubflowInstanceType") {
		return true;
	}
	return false;
}
