(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_cluster_node_stats');
	gr.addQuery('node_id', current.getValue('node_id')); 
	gr.query();
	if (gr.next()) {
		gr.deleteMultiple();
	}
})(current, previous);
