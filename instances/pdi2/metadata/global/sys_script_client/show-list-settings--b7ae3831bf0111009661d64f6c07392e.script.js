function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == 'list') {
		g_form.setSectionDisplay('list_settings', true);
	} else {
	    g_form.setSectionDisplay('list_settings', false);
	}
}
