function onGraphObjectClicked(item, diagram, dispatch) {
	// Implement click handler
	diagram.commandHandler.showContextMenu(item.part);
}
