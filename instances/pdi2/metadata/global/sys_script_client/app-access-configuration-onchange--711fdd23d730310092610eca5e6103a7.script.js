function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}

	var allowConfiguration = g_form.getBooleanValue('configuration_access');
	g_form.setValue('alter_access', allowConfiguration);
	g_form.setValue('actions_access', allowConfiguration);
	g_form.setValue('client_scripts_access', allowConfiguration);
}
