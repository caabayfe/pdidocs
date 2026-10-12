function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	if (newValue === '1')
		g_form.setValue('format', 'v4');
}
