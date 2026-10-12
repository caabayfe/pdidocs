function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var type_value = g_form.getValue('type');
	var compare_value = g_form.getValue('is_compare_chart');
	if ((newValue == 'line' || (newValue == 'column'  && type_value == 'time') || newValue == 'spline' || newValue == 'area' || newValue == 'step' || newValue == 'stacked' || newValue == 'column_total' || newValue == 'relative') && (compare_value == 'false' || type_value != 'time')) {
		g_form.setSectionDisplay('date_settings', true);
	} else {
	    g_form.setSectionDisplay('date_settings', false);
	}
	if (compare_value == 'true' && type_value == 'time') {
		g_form.setMandatory('compare_number_of_periods', true);
		g_form.setMandatory('compare_period', true);
		g_form.setSectionDisplay('previous_periodsettings', true);
	} else {
		g_form.setMandatory('compare_number_of_periods', false);
		g_form.setMandatory('compare_period', false);
	    g_form.setSectionDisplay('previous_periodsettings', false);
	}
}
