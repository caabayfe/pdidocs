function updateStats() {
	var dashSysId = event.instance;
	var userSysId = event.user_id;
	var executionTimestamp = event.sys_created_on;
	var params = JSON.parse(event.parm1);
	var executionDuration = params.executionTime != undefined ? params.executionTime : event.parm1;
	var table = params.table ? params.table : event.table;
	var updateViewCount = params.updateViewCount != null ? params.updateViewCount : true;

	var dashboardStats = new SNC.DashboardStats();
	dashboardStats.updateStats(dashSysId, userSysId, executionTimestamp, executionDuration, table, updateViewCount);
}
updateStats();
