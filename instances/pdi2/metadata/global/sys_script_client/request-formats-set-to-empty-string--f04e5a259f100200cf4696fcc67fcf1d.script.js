function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	if (newValue == '') {
		g_form.showFieldMsg('consumes',
			getMessage("Cannot set to empty value. To restore the default value, uncheck the override setting."),
			'error');
	}
}
