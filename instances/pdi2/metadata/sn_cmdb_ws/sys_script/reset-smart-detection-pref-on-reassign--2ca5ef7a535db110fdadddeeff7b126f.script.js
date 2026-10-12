(function executeRule(current, previous /*null when async*/ ) {

	var smartDetectionUtil = new sn_cmdb_ws.CMDBAttestationSmartDetectionUtil();
	// after each reassignment, reset the preference set on task
	smartDetectionUtil.resetTaskUserPref(current.sys_id);

})(current, previous);
