function disableMenuOption(diagram, node, actionPropertyMap) {
    // Add code to control disabling this option.
    // Sample code to disable the option using node property for Switch node in read only mode.
	if(diagram.model.isReadOnly && node.data.key == 'f1c3329b53103110de44ddeeff7b1263')
		return true;
    return false;
}
