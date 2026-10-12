function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	new MultiChoiceValidator().validate(g_form.getValue('type'), newValue, g_form.getValue('do_not_select_first'), g_form.getValue('include_none'));
}
