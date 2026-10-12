function transform(input) {	
	var taskId = input.taskId;
	var util = new sn_cmdb_ws.CMDBAttestationUtil();
	var smartDetectionUtil = new sn_cmdb_ws.CMDBAttestationSmartDetectionUtil();
	
	var result = {};
	var totalCICount = 0;
	var attestedCICount = 0;
	var rejectedCICount = 0;
	var nextScheduledReview = "";
	
	var outputArr = util.getCountBasedOnAttestationStatus(taskId);
	for (var i = 0; i < outputArr.length; i++) {
		totalCICount += outputArr[i].count;
		if (outputArr[i].attestation_status === util.ACTIONS_MAPPING["attest"].attestation_status) {
			attestedCICount = outputArr[i].count;
		} else if (outputArr[i].attestation_status === util.ACTIONS_MAPPING["reject"].attestation_status) {
			rejectedCICount = outputArr[i].count;
		}
	}
	
	util.updateAttestationCount(taskId);
	var taskState = util.getTaskState(taskId);

	var taskGr = new GlideRecord(util.wsUtil.TABLES.CMDB_DATA_MANAGEMENT_TASK);
	taskGr.get(taskId);
	var sysTriggerGr = new GlideRecord(util.wsUtil.TABLES.SYS_TRIGGER);
	sysTriggerGr.addQuery(util.wsUtil.COLS.DOCUMENT_KEY, taskGr.getDisplayValue("policy_id.policy_execution_job.sys_id"));
	sysTriggerGr.addQuery(util.wsUtil.COLS.TRIGGER_TYPE, util.wsUtil.OPERATORS.NOTEQUAL, util.wsUtil.TRIGGER_TYPE.DEMAND);
	sysTriggerGr.query();
	if (sysTriggerGr.next()) {
		nextScheduledReview = sysTriggerGr.getValue(util.wsUtil.COLS.NEXT_ACTION);

		var gd = new GlideDate();
		gd.setValue(nextScheduledReview);
		nextScheduledReview = gd.getByFormat(gs.getDateTimeFormat()); // format as per user's date time preference
	}
	totalCICount += taskState.excludedCis + taskState.duplicateCis;
	result.totalCICount = totalCICount;
	result.attestedCICount = attestedCICount;
	result.rejectedCICount = rejectedCICount;
	result.duplicateCICount = taskState.duplicateCis;
	result.excludedCICount = taskState.excludedCis;
	result.nextScheduledReview = nextScheduledReview;
	
	var comments = gs.getMessage("Summary of activities:\n");
	comments += gs.getMessage("Total CIs: {0}\n", [totalCICount.toString()]);
	comments += gs.getMessage("Attested CIs: {0}\n", [attestedCICount.toString()]);
	comments += gs.getMessage("Rejected CIs: {0}\n", [rejectedCICount.toString()]);
	comments += gs.getMessage("Excluded CIs: {0}\n", [taskState.excludedCis.toString()]);
	comments += gs.getMessage("Duplicate CIs: {0}\n", [taskState.duplicateCis.toString()]);
	taskGr.comments = comments;

	taskGr.setValue('state', util.TASK_STATE.CLOSED_COMPLETE); // set task state to closed complete
	if (taskGr.canWrite() && taskGr.update()) {
		var usersList = util.getUsersWithDataManagerAdminRole();
		gs.eventQueue(util.NOTIFICATION_EVENTS.TASK_COMPLETED, taskGr, usersList.toString(), JSON.stringify(result));
	}
	else {
		result.error = true;
	}
	return result;
}
