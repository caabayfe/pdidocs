function getSelectedNode() {
	var selectedNodesID = window.selectedNode;
	var grc = new GlideRecord('sys_cluster_state');
	grc.addQuery('sys_id', 'IN', selectedNodesID);
	grc.query();
	var selectedNodes = [];
	while (grc.next())
		selectedNodes.push(grc.getValue('system_id'));

	return selectedNodes.join(';');
}
