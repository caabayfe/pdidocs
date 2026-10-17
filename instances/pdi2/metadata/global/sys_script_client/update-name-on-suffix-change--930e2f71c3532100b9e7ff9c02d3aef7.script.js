function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;
	
	var scope = g_scratchpad.scope;
	scope = scope == 'global' ? '' : scope + '_';
	g_form.setValue('name', scope + newValue);
}
