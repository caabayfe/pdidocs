(function executeRule(current, previous /*null when async*/) {
	var dashboardSysId = current.sys_id;
	
	if (!dashboardSysId) {
		gs.info('No dashboardId. Cannot delete cache');
		return;
	}

})(current, previous);
