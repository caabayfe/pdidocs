function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var type_value = g_form.getValue('type');
	if (type_value == 'score' && (newValue == 'speedometer' || newValue == 'dial')) {
		g_form.setSectionDisplay('speedometerdial_settings', true);
	} else {
	    g_form.setSectionDisplay('speedometerdial_settings', false);
	}
}
