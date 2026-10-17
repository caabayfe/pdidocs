function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	var EndPointType = {};
	EndPointType = {
		Custom: '1',
		ConfigureChoices: '2',
		ConfigureLabel: '3',
		AssignmentRule: '4',
		FormLayout: '5',
		ConfigureTable: '6',
		ConfigureProperty: '7',
		ConfigurePlugin: '8',
		ConfigureFilter: '9'
	};
	g_form.setMandatory('table', false);
	g_form.setMandatory('field', false);
	g_form.setMandatory('end_point', false);
	g_form.setMandatory('end_point_open_mode', false);
	g_form.setMandatory('property_name', false);
	g_form.setMandatory('property_value', false);
	g_form.setMandatory('plugin_id', false);
	g_form.setMandatory('filter', false);
	g_form.setMandatory('filter_result', false);
	g_form.setMandatory('is_dynamic', false);
	g_form.setDisplay('plugin_id', false);
	g_form.setDisplay('property_name', false);
	g_form.setDisplay('property_value', false);
	g_form.setDisplay('filter', false);
	g_form.setDisplay('filter_result', false);
	g_form.setDisplay('is_dynamic', false);

	g_form.setValue('table', '');
	g_form.setValue('field', '');
	g_form.setValue('property_name', '');
	g_form.setValue('property_value', '');
	g_form.setValue('plugin_id', '');
	g_form.setValue('is_dynamic', false);

	if (newValue !== '') {
		g_form.setDisplay('end_point_open_mode', true);
		g_form.setMandatory('end_point_open_mode', true);
	} else {
		g_form.setDisplay('end_point_open_mode', false);
	}
	if (newValue === EndPointType.Custom ||  newValue === '') {
		g_form.setDisplay('table', false);
		g_form.setDisplay('field', false);
		if (newValue === EndPointType.Custom) {
			g_form.setDisplay('end_point', true);
			g_form.setMandatory('end_point', true);
		} else {
			g_form.setDisplay('end_point', false);
		}
	} else if (newValue === EndPointType.ConfigureChoices || newValue === EndPointType.ConfigureLabel) {
		g_form.setDisplay('table', true);
		g_form.setDisplay('field', true);
		g_form.setMandatory('table', true);
		g_form.setMandatory('field', true);

		g_form.setDisplay('end_point', false);
	} else if (newValue === EndPointType.AssignmentRule || newValue === EndPointType.FormLayout || newValue === EndPointType.ConfigureTable) {
		g_form.setDisplay('table', true);
		g_form.setMandatory('table', true);
		g_form.setDisplay('field', false);

		g_form.setDisplay('end_point', false);
	}  else if (newValue === EndPointType.ConfigureProperty) {
		g_form.setMandatory('table', false);
		g_form.setDisplay('table', false);
		g_form.setMandatory('field', false);
		g_form.setDisplay('field', false);

		g_form.setMandatory('property_name', true);
		g_form.setDisplay('property_name', true);
		g_form.setMandatory('property_value', true);
		g_form.setDisplay('property_value', true);
		g_form.setDisplay('is_dynamic', true);

		g_form.setDisplay('end_point', false);
	}  else if (newValue === EndPointType.ConfigurePlugin) {
		g_form.setMandatory('table', false);
		g_form.setDisplay('table', false);
		g_form.setMandatory('field', false);
		g_form.setDisplay('field', false);

		g_form.setMandatory('plugin_id', true);
		g_form.setDisplay('plugin_id', true);
		g_form.setDisplay('is_dynamic', true);

		g_form.setDisplay('end_point', false);
	} else if (newValue === EndPointType.ConfigureFilter) {
		g_form.setMandatory('field', false);
		g_form.setDisplay('field', false);

		g_form.setMandatory('table', true);
		g_form.setDisplay('table', true);
		g_form.setDisplay('filter', true);
		g_form.setMandatory('filter_result', true);
		g_form.setDisplay('filter_result', true);
		g_form.setDisplay('is_dynamic', true);

		g_form.setDisplay('end_point', false);
	}
}
