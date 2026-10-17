(function executeRule(current, previous /*null when async*/) {

	//delete report_stats_executions rows
	var sysId = (current.report_sys_id != null && current.report_sys_id.toString().length > 0) ? current.report_sys_id : current.widget_sys_id;
	//DEF0416723: when both report_sys_id and widget_sys_id are empty, don't perform any deletion
	if (sysId == null || sysId.toString().length == 0)
		return;

	var field = (current.report_sys_id != null && current.report_sys_id.toString().length > 0) ? 'report_sys_id' : 'widget_sys_id';
	try {
		var grStatsExecution = new GlideRecord('report_stats_executions');
		if (grStatsExecution.isValid()){ //if table exists
			grStatsExecution.addQuery(field,sysId);
			grStatsExecution.query();
			grStatsExecution.deleteMultiple();
		}

		//if it's a report delete report_executions rows
		if (current.report_sys_id != null) {
			var grReportExecutions = new GlideRecord('report_executions');
			if (grReportExecutions.isValid()) { //if table exists
				grReportExecutions.addQuery('report_sys_id',sysId);
				grReportExecutions.query();
				grReportExecutions.deleteMultiple();
			}
		}
		gs.addInfoMessage(gs.getMessage('Statistics for {0}={1} were deleted.',[field,sysId]));
	} catch(e){
		gs.addErrorMessage(gs.getMessage('An error occurred when deleting statistics for {0}={1}',[field,sysId]));
	}
	
})(current, previous);
