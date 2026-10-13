(function executeRule(current, previous /*null when async*/) {
	if (!current.response_to)
		return;

	current.sys_created_by = current.response_to.sys_created_by;
	current.sys_domain = current.response_to.sys_domain;
})(current, previous);
