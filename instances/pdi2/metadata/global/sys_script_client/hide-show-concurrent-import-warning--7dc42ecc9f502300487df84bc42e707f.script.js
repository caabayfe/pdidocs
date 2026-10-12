function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	g_form.hideFieldMsg('concurrent_import',true);
	if (g_form.getValue('concurrent_import') === 'true')
		g_form.showFieldMsg('concurrent_import', getMessage('Warning message for concurrent import', 'info'));
}
