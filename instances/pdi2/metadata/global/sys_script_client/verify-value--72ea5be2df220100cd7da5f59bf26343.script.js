function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;

	var value = g_form.getDecimalValue("value");
	if (value < 0) {
		g_form.setValue('value', '');
		g_form.showFieldMsg("value", getMessage("The value must be greater than or equal 0"), "error");
	}
	
	else if(!Number.isInteger(value)){
		g_form.setValue('value', '');
		g_form.showFieldMsg("value", getMessage("The value must be an Integer"), "error");
	}
}
