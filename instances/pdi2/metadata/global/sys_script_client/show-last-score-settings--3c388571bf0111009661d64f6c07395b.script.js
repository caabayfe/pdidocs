function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var type_value = g_form.getValue('type');
	if (type_value == 'score' && newValue == 'latest') {
		g_form.setSectionDisplay('latest_scoresettings', true);
	} else {
	   g_form.setSectionDisplay('latest_scoresettings', false);
	}
}
