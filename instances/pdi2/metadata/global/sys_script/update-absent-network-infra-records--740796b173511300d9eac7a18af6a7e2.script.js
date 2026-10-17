(function executeRule(current, previous) {
	
	if (executedProbe('SNMP - Switch - BridgePortTable'))
		updateAbsent('discovery_switch_bridge_port_table');

	if (executedProbe('SNMP - Switch - SpanningTreeTable'))
		updateAbsent('discovery_switch_spanning_tree_table');

	function executedProbe(name) {
		var gr = new GlideRecord('ecc_queue');
		gr.addQuery('agent_correlator', current.status);
		gr.addQuery('source', current.source);
		gr.addQuery('queue', 'output');
		gr.addQuery('name', name);
		gr.query();
		return gr.hasNext();
	}

	function updateAbsent(table) {
		var gr = new GlideRecord(table);
		gr.addQuery('cmdb_ci', current.cmdb_ci);
		gr.addQuery('sys_updated_on', '<', current.sys_created_on);
		gr.addQuery('absent', false);
		gr.setValue('absent', true);
		gr.updateMultiple();
	}


})(current, previous);
