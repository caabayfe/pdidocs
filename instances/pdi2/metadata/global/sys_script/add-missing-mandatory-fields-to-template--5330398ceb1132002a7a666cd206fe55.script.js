(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord())
		return;

	if (g_scratchpad.is_template_readonly)
		return;
	
	current.template_value = new StdChangeUtils().addMandatoryFieldsToTemplate(current.getValue("template_value"));
})(current, previous);
