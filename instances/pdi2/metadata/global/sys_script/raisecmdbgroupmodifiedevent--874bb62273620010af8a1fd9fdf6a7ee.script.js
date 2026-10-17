(function executeRule(current, previous /*null when async*/) { 
	sn_cmdbgroup.CMDBGroupAPI.enqueueEvent(current.group, 'update');
})(current, previous);
