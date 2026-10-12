function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;

	var ribbon = g_form.getValue('ribbon');
	if (!ribbon)
		return;

	if (newValue == '' || g_scratchpad.ribbonTables[ribbon] != newValue)
		g_form.clearValue('ribbon');
}
