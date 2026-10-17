(function executeRule(current, previous /*null when async*/) {

	new sn_cmdb_ws.CMDBWsDMTaskAccessor().initializeAttributeStatus(current.sys_id + '');

})(current, previous);
