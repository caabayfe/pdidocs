(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.includeInSystem = current.getDisplayValue('default');
	g_scratchpad.preserve_increase_clone_msg = gs.getMessage('preserve_increase_clone_msg');
	g_scratchpad.preserve_increase_clone_use_conditions_msg = gs.getMessage('preserve_increase_clone_use_conditions_msg');
})(current, previous);
