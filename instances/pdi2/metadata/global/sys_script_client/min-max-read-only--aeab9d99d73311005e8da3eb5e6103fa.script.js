function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '')
		return;
	
	var datatype = g_form.getValue('datatype');
	if (datatype == 'choice' || datatype == 'scale') {
		g_form.setReadOnly('min', true);
		g_form.setReadOnly('max', true);
	} else {
		g_form.setReadOnly('min', false);
		g_form.setReadOnly('max', false);
	}
}
