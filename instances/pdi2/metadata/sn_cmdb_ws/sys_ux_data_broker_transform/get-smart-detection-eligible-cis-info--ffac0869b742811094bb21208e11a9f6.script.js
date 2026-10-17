function transform(input) {
    var taskId = input.taskId;
	
	var smartDetectionUtil = new sn_cmdb_ws.CMDBAttestationSmartDetectionUtil();
	return smartDetectionUtil.getSmartDetectionEligibleCIsInfo(taskId);
}
