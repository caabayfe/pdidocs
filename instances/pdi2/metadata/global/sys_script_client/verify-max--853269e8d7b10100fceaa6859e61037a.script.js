function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;
	
	var datatype = g_form.getValue('datatype');
	if (datatype == 'template')
		return;

    g_form.hideFieldMsg("max");
    g_form.hideFieldMsg("min");
	
	var min = g_form.getDecimalValue("min");
	var max = g_form.getDecimalValue("max");
	
	if (datatype == 'choice' || datatype == 'scale') {
		// These data types are derived from the metric definition table so should not typically be entered on the form
		if (max < min) {
			g_form.showFieldMsg("max", getMessage("The maximum value must be greater than or equal to the minimum value"), "error");
			return;
		}
	} else {
		if (max <= min) {
			g_form.showFieldMsg("max", getMessage("The maximum value must be greater than the minimum value"), "error");
			return;
		}
	}
	if (max < 0) {
		g_form.showFieldMsg("max", getMessage("The maximum value must be greater than or equal to 0"), "error");
		return;
	}
}
