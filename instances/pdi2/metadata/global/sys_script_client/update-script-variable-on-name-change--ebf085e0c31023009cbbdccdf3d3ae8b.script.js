function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	var name = g_form.getValue('name');
	g_form.setValue('script_variable', 'global_' + name);

}
