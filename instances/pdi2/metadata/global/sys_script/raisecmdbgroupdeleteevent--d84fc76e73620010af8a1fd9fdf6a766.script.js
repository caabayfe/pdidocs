(function executeRule(current, previous /*null when async*/) {
	//Note: Updating on other columns, for this table, does not change the result(count of cis) 
	// hence do not need to raise update event as per the current requirement.
	// This BR can't be Async as we will loose the sys_id othewise.
	sn_cmdbgroup.CMDBGroupAPI.enqueueEvent(current.sys_id, 'delete');
})(current, previous);
