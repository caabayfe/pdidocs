function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var scope = g_scratchpad.scope;
	if (scope === 'global')
		return;

	var prefix = scope + '.';
	if (newValue === scope || newValue.startsWith(prefix))
		return;

	newValue = (newValue === '') ? scope : prefix + newValue;

	g_form.setValue("logger_name", newValue);
}
