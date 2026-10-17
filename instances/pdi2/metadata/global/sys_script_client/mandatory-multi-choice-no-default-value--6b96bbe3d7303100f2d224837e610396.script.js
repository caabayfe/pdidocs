function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	new MultiChoiceValidator().validate(g_form.getValue('type'), g_form.getValue('mandatory'), newValue, g_form.getValue('include_none'));
}
