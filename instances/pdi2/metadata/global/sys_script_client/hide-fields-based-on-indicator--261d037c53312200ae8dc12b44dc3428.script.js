function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// sys_id of the "Time" unit record
	var timeUnitSysId = "de9d8dc0d7202200f913ce737e6103a0";
	var indicatorGR = g_form.getReference("indicator");

	// set display for breakdown_level2 and element_level2 based on indicator type
	// added here since indicatorGR is already used
	if (g_form.getValue("indicator")) {
		if (indicatorGR.type == 4) {
			g_form.setDisplay("breakdown_level2", false);
			g_form.setDisplay("element_level2", false);
		}
	}

	if (indicatorGR.unit == timeUnitSysId){
		g_form.setDisplay("show_data_labels", false);
		return;
	}

	var type_value = g_form.getValue('type');
	var visualization_value = g_form.getValue('visualization');
	var showDataLabels = (type_value == 'time' ||
	(type_value == 'breakdown' && visualization_value != 'scorecard' && visualization_value != 'pivot_scorecard') ||
	type_value == 'pivot');
	g_form.setDisplay("show_data_labels", showDataLabels);

}
