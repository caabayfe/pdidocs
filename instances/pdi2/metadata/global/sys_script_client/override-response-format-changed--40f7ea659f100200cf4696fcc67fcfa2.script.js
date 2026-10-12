function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	// hide message
	g_form.hideFieldMsg('produces', true);
	
	// if set to false, restore default from parent
	if (!newValue)
		g_form.setValue('produces', g_scratchpad.parent_produces);
}
