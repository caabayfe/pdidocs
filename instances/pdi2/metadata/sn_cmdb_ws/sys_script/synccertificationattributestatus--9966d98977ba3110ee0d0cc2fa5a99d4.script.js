(function executeRule(current, previous /*null when async*/) {

	new sn_cmdb_ws.CMDBWsDMTaskManager().syncCertificationAttributeStatusReportRecord(current.sys_id);

})(current, previous);
