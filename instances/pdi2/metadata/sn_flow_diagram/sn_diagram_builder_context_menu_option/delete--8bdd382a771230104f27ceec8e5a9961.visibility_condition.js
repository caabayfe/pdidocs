function showMenuOption(diagram, node, actionPropertyMap) {
	// don't allow CATCH nodes to be explicitly deleted
    if (node && node.data && node.data.definition_type === 'CATCH') {
		return false;
	}
	
	// this delete is in the flow diagramming application and is not to be confused with the delete in the app diagram builder of the same name
	return !diagram.isReadOnly;
}
