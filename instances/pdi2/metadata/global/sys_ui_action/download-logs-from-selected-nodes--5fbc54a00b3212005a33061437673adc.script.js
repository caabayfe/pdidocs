function downloadLogsFromSelectedNodes() {
	window.selectedNode = g_list.getChecked();
	var grc = new GlideRecord('sys_cluster_state');
	grc.addQuery('sys_id', 'IN', selectedNode);
	grc.query();
	while (grc.next())
		if (grc.getValue('status') != 'online' || grc.getValue('schedulers') === 'none') {
			alert ('The node status is offline or the scheduler mode is none');
			return;
		}

	var gdw = new GlideModal('download_logs_from_selected_nodes');
	gdw.setTitle('Download Logs from Selected Nodes');
	gdw.render();
}
