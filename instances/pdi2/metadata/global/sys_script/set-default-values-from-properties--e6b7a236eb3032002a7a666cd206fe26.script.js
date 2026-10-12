(function executeRule(current, previous /*null when async*/) {

	if (!current.isNewRecord())
		return;
	
	if (current.template.isNil() && g_scratchpad && g_scratchpad.std_chg_task_props)
		current.template = g_scratchpad.std_chg_task_props.default_values;

})(current, previous);
