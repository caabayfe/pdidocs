function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	new MultiChoiceValidator().validate(g_form.getValue('type'), g_form.getValue('mandatory'), g_form.getValue('do_not_select_first'), newValue);
}
