(function executeRule(current, previous /*null when async*/) {

	var smartDetectionUtil = new sn_cmdb_ws.CMDBAttestationSmartDetectionUtil();
	// // once the task is cancelled, delete task state
	smartDetectionUtil.deleteTaskState(current.sys_id);

})(current, previous);
