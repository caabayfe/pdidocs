(function executeRule(current, previous /*null when async*/) {
	if (parent) {
		current.setValue("context_profile", parent.sys_id);
	}
})(current, previous);
