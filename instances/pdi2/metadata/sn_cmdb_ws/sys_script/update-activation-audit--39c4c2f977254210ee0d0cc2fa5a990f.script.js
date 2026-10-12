(function executeRule(current, previous /*null when async*/) {

	var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
	if (current.active) {
		util._updateExecutionStatsActiveStatus(current.sys_id, false);
	}
	util._insertOrUpdateActivationAuditRecord(current.sys_id, util.ACTION_TYPE.MANUAL, '');

})(current, previous);
