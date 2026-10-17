(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.currentChoices = ''+ new ITSMChoiceValues().getTableChoices(current.getValue('target_table'), current.getValue('target_field'));
})(current, previous);
