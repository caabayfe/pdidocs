function onCondition() {
	if(g_scratchpad.goal_contains_child) {
		g_form.setReadOnly('percent_complete', true);
	}else
		g_form.setReadOnly('percent_complete', false);
}
