(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.is_template_readonly = false;
	
	if (current.isNewRecord())
		return;
	
	g_scratchpad.is_template_readonly = !(new StdChangeUtils().reviewedFieldsAcl(current));
})(current, previous);
