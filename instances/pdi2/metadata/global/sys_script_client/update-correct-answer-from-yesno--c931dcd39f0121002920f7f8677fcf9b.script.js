function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	var datatype = g_form.getValue('datatype');
	if (datatype == 'boolean') {
		g_form.setValue('correct_answer', newValue);
	}
}
