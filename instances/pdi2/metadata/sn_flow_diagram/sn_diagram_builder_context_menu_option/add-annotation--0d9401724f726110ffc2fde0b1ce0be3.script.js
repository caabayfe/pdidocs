function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
	dispatch("FLOWDIAGRAM_DATA#ADD_ANNOTATION", { node: node, diagram: diagram });
}
