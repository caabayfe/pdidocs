function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var type = g_form.getValue('type');
	var visualization = g_form.getValue('visualization');
	if (type == 'time' && visualization != 'relative') {
		if (newValue == 'true') {
			g_form.setMandatory('compare_number_of_periods', true);
			g_form.setMandatory('compare_period', true);
			g_form.setSectionDisplay('previous_periodsettings', true);
			g_form.setSectionDisplay('date_settings', false);
			g_form.hideRelatedList('REL:2e434d10d7213100757a4251ce610331_list');
		} else {
			g_form.setMandatory('compare_number_of_periods', false);
			g_form.setMandatory('compare_period', false);
			g_form.setSectionDisplay('previous_periodsettings', false);
			g_form.setSectionDisplay('date_settings', true);
			g_form.showRelatedList('REL:2e434d10d7213100757a4251ce610331_list');
		}
	}
}
