function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
	dispatch("FLOWDIAGRAM_DATA#DUPLICATE_NODE", { key: node.data.key});
}
