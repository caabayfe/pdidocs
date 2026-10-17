(function executeRule(current, previous /*null when async*/) {
	new ATFOrderUpdate().updateOrder('sys_atf_step', current, previous);
})(current, previous);
