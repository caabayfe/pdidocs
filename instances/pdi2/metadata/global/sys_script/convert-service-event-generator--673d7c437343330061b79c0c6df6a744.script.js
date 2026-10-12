(function executeRule(current, previous /*null when async*/) {
	
	gs.eventQueue('convert_cmdb_service', current, current.getDisplayValue('service'), null, 'sn_cmdb_service_queue');

})(current, previous);
