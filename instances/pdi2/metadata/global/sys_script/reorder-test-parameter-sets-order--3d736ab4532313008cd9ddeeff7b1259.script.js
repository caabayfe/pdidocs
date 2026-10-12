(function executeRule(current, previous /*null when async*/) {

	new ATFOrderUpdate().updateOrder('sys_atf_parameter_set', current, previous);

})(current, previous);
