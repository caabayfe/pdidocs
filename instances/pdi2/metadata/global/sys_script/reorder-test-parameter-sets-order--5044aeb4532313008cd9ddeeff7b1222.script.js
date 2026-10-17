(function executeRule(current, previous /*null when async*/) {
	
	new ATFOrderUpdate().updateRecordsAfterCurrent('sys_atf_parameter_set', current);
	
})(current, previous);
