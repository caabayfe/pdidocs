function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		  return;
	}
	var type = g_form.getValue('type');
	var showHelp = g_form.getValue('show_help');
	if(showHelp == 'true') {
		g_form.setDisplay('show_help_on_load', true);
		if (type == '19') {
			g_form.setValue('show_help_on_load', false);
			g_form.setReadOnly('show_help_on_load', true);
		}
		else
			g_form.setReadOnly('show_help_on_load', false);
	} else {
		g_form.setDisplay('show_help_on_load', false);
	}
}
