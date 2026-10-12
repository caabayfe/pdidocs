(function executeRule(current, previous /*null when async*/) {
	current.setWorkflow(false);  // Do not update version record in sys_update_version when only the Last export scheduled run changes.
})(current, previous);
