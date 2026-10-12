function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	new MultiChoiceValidator().validate(newValue, g_form.getValue('mandatory'), g_form.getValue('do_not_select_first'), g_form.getValue('include_none'));
}
