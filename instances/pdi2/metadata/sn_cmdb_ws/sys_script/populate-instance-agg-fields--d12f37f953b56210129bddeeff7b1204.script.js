(function executeRule(current, previous /*null when async*/) {

	new sn_cmdb_ws.CMDBWsDMCertDashboardManager().queueUpdateCertInstanceAggDataEvent(current.sys_id + '');

})(current, previous);
