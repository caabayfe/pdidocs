function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	var datatype = g_form.getValue('datatype');
	if (datatype == 'checkbox')
		g_form.setValue('correct_answer', newValue);
}
