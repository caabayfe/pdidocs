function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
	dispatch("FLOWDIAGRAM_DATA#EDIT_ANNOTATION", { node: node, diagram: diagram });
}
