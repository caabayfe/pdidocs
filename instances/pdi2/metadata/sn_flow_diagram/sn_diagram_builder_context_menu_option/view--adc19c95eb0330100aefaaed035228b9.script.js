function onMenuOptionClicked(diagram, node, actionPropertyMap, dispatch) {
	dispatch("DIAGRAM_CONTEXT#VIEW_FLOW_NODE", node.data);
}
