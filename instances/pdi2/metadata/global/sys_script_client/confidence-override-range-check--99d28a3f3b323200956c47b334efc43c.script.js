function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;
	
	var confidenceVal = g_form.getIntValue('value');
	
	if (confidenceVal < 0 || confidenceVal > 100)
		g_form.showFieldMsg('value', getMessage('Override Value must be between 0 and 100'), 'error');
}
