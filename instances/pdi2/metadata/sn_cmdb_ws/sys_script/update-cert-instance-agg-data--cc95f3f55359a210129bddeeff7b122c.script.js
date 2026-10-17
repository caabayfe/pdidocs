(function executeRule(current, previous /*null when async*/) {

	var manager = new sn_cmdb_ws.CMDBWsDMCertDashboardManager();
	if (manager._shouldRecalculateInstanceAggregate(current, previous)) {
		manager.queueUpdateCertInstanceAggDataEvent(current.execution_id + '');
	}

})(current, previous);
