function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	if (newValue == 'true') {
		g_form.setVisible('context_name', true);
		g_form.setMandatory('context_name', true);
	} else 
		g_form.clearValue('context_name');
}
