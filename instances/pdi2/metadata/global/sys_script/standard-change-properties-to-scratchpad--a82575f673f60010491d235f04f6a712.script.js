(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.standardChange = {};
	g_scratchpad.standardChange.readOnlyFields = new StdChangeUtils().getReadOnlyFields();
	g_scratchpad.standardChange.preventInactiveInsert = gs.getProperty(new StdChangeUtils().SYS_PROP_PREVENT_INACTIVE_INSERT, "false") === "true";
	g_scratchpad.standardChange.stdChangeTemplateActive = current.std_change_producer_version.std_change_producer.active.getValue() === "1";
	g_scratchpad.standardChange.stdChangeTemplateName = current.std_change_producer_version.std_change_producer.getDisplayValue();
})(current, previous);
