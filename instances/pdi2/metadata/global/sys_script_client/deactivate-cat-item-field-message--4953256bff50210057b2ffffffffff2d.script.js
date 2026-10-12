function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;
	
	if (typeof g_scratchpad.removeInactiveItems == 'undefined' || g_scratchpad.removeInactiveItems == null)
		return;
	
	// Display info message when the active field is set to false
	if (newValue == 'false' && g_scratchpad.removeInactiveItems == 'true') {
		var msg = getMessage('Saving the record as inactive will remove this catalog item from all shopping carts');
		g_form.showFieldMsg('active', msg, 'info', true);
	}
}
