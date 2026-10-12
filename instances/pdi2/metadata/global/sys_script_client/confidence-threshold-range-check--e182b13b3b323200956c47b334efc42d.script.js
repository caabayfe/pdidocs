function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;
	
	var confidenceVal = g_form.getIntValue('default_global_minimum_accuracy');
	
	if (confidenceVal < 0 || confidenceVal > 100)
		g_form.showFieldMsg('default_global_minimum_accuracy', getMessage('Default Global Minimum Accuracy must be between 0 and 100'), 'error');
}
