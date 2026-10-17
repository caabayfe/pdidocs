function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	if (newValue === 'true') {
		g_form.setMandatory('source_table', false);
		g_form.setVisible('source_table', false);
	} else {
		g_form.setMandatory('source_table', true);
		g_form.setVisible('source_table', true);
	}
}
