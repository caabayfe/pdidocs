function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (g_form.getValue('type') === 'text') {
		var newValueAsInt = parseInt(newValue, 10);
		if (newValueAsInt < 0)
			g_form.showErrorBox('words_in_trendline', 'Positive value expected');
		
		if (newValueAsInt > 20)
			g_form.showErrorBox('words_in_trendline', 'Max words in trendline is 20');
	}
}
