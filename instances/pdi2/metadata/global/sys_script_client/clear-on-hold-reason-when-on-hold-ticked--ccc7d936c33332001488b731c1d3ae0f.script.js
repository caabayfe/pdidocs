function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// Clear On hold reason when on hold ticked
	if (newValue === 'true') {
		if (!isLoading)
			g_form.clearValue('on_hold_reason');
	}		
}
