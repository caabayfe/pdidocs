function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;

	if (oldValue === 'aedc6a625323101034d1ddeeff7b1296') 
		g_form.setMandatory('work_notes', true);
}
