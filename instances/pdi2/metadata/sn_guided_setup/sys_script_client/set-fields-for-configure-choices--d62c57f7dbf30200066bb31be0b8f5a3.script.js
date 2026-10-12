function onLoad() {
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

	var endPointTypeValue = g_form.getValue('end_point_type');
	if (endPointTypeValue === EndPointType.Custom) {
		hideTableAndField();
		hidePropertiesAndPlugin();
	} else if (endPointTypeValue === EndPointType.AssignmentRule || endPointTypeValue === EndPointType.FormLayout || endPointTypeValue === EndPointType.ConfigureTable) {
		hidePropertiesAndPlugin();
		g_form.setDisplay('field', false);
	} else if (endPointTypeValue === "") {
		hideTableAndField();
		hidePropertiesAndPlugin();
		g_form.setDisplay('end_point_open_mode', false);
	} else if (endPointTypeValue === EndPointType.ConfigureProperty) {
		hideTableAndField();
		g_form.setDisplay('property_name', true);
		g_form.setDisplay('property_value', true);
		g_form.setDisplay('is_dynamic', true);
		g_form.setDisplay('plugin_id', false);
		g_form.setDisplay('filter', false);
		g_form.setDisplay('filter_result', false);
	} else if (endPointTypeValue === EndPointType.ConfigurePlugin) {
		hideTableAndField();
		g_form.setDisplay('property_name', false);
		g_form.setDisplay('property_value', false);
		g_form.setDisplay('filter', false);
		g_form.setDisplay('filter_result', false);
		g_form.setDisplay('plugin_id', true);
		g_form.setDisplay('is_dynamic', true);
	} else if (endPointTypeValue === EndPointType.ConfigureFilter) {
		hideTableAndField();
		g_form.setDisplay('property_name', false);
		g_form.setDisplay('property_value', false);
		g_form.setDisplay('plugin_id', false);
		g_form.setDisplay('table', true);
		g_form.setDisplay('filter', true);
		g_form.setDisplay('filter_result', true);
		g_form.setDisplay('is_dynamic', true);
	}

	if (endPointTypeValue != EndPointType.Custom) {
		g_form.setDisplay('end_point', false);
	}

	var open_mode = g_form.getValue('end_point_open_mode');
	if (open_mode != 2) {
		g_form.showFieldMsg('end_point', getMessage('External domain urls should not be configured as "inline" or "modal" as they might not be viewable due to security restrictions. Please choose option "new window" for such end points.'));
	}
}

function hideTableAndField() {
	g_form.setDisplay('table', false);
	g_form.setDisplay('field', false);
}

function hidePropertiesAndPlugin() {
	g_form.setDisplay('property_name', false);
	g_form.setDisplay('property_value', false);
	g_form.setDisplay('plugin_id', false);
	g_form.setDisplay('filter', false);
	g_form.setDisplay('filter_result', false);
	g_form.setDisplay('is_dynamic', false);
}
