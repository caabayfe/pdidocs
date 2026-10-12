(function executeRule(current, previous /*null when async*/) {

	// When the survey was set up as "Anonymize response", we need to hide survey user's name.
	current.autoSysFields(false);
	current.setValue("sys_updated_by", "guest");
	current.setValue("sys_created_by", "guest");

})(current, previous);
