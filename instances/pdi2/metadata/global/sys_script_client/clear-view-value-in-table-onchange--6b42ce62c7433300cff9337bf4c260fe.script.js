function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || !g_form || !g_form.getValue('view')) {
		return;
	}
	g_form.clearValue('view');
}
