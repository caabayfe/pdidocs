(function executeRule(current, previous /*null when async*/) {
	new ATFOrderUpdate().updateRecordsAfterCurrent('sys_atf_step', current);	
})(current, previous);
