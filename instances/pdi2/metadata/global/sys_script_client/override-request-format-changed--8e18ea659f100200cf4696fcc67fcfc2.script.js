function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	// hide message
	g_form.hideFieldMsg('consumes', true);
	
	// if set to false, restore default from parent
	if (!newValue)
		g_form.setValue('consumes', g_scratchpad.parent_consumes);
}
