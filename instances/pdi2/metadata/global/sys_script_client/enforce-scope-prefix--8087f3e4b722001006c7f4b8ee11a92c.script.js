function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	// don't enforce if creating from existing property
	if (g_form.getValue('property') != '')
		return;
	
	var scope = g_scratchpad.scope;
	if (scope == 'global')
		return;
	
	if (newValue.startsWith(scope + '.'))
		return;

	g_form.setValue('name', scope + '.' + newValue);
   
}
