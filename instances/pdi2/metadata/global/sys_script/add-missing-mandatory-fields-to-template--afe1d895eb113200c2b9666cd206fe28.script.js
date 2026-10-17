(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord())
		return;

	if (g_scratchpad.is_template_readonly)
		return;
	
	current.template = new StdChangeTaskUtils().addMandatoryFieldsToTemplate(current.getValue("template"));
})(current, previous);
