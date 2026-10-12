function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
	dispatch("FLOWDIAGRAM_DATA#OPEN_IN_DESIGNER", { key: node.data.key });
}
