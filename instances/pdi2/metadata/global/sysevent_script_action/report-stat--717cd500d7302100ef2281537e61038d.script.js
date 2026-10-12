
function updateStats() {
	var reportSysId = event.instance;
	var userSysId = event.user_id;
	var executionTimestamp = event.sys_created_on;
	var executionDuration = event.parm1;
	var reportStats = new SNC.ReportStats();
	var table = event.table;

	reportStats.updateStats(reportSysId, userSysId, executionTimestamp, executionDuration, table, event.parm2);
}
updateStats();
