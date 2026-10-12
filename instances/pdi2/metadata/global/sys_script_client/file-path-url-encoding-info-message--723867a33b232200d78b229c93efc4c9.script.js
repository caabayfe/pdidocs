function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	g_form.hideFieldMsg('file_path', true);
	if (newValue == 'HTTP' || newValue == 'HTTPS') {
		g_form.showFieldMsg('file_path', getMessage('URL encoding is not supported in the File path', 'info'));
	}
}
