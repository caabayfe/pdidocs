(function refineQuery(current, parent) {
	// List the MID Server upgrade stages (InProgress or Failed states) for the MID
	// Servers that are not upgraded properly yet.
	var gr = new GlideRecord('ecc_agent_upgrade_history_stage');
	gr.addQuery('stage', 'MidUpgraded');
	gr.addQuery('state', 'Completed');
	gr.addQuery('upgrade_history', parent.sys_id);
	gr.query();
	var successfulUpgrades = [];
	while (gr.next())
		successfulUpgrades.push(gr.getValue('mid_server'));
	
	current.addQuery('upgrade_history', parent.sys_id);
	current.addQuery('mid_server', 'NOT IN' , successfulUpgrades);
	var qc1 = current.addQuery('state', 'InProgress');
	qc1.addOrCondition('state', 'Failed');
	current.orderByDesc('sys_created_on');
	
})(current, parent);
