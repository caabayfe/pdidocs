(function executeRule(current, previous /*null when async*/) {
var dashboardSysId = current.dashboard;
	
	if (!dashboardSysId) {
		gs.info('No dashboardId. Cannot delete cache');
		return;
	}

})(current, previous);
