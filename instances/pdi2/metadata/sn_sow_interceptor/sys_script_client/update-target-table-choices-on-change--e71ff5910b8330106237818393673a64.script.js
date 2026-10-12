function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var choices = g_scratchpad.target_table_choices[newValue];

	// Clear existing options
	g_form.clearOptions('target_table');

	for (var i = 0; i < choices.length; i++) {
		// Add options for table selected and its child tables
		g_form.addOption('target_table', choices[i].name, choices[i].label + ' [' + choices[i].name + ']');
	}

	if (choices.length > 1)
		g_form.setDisplay('target_table', true);
	else
		g_form.setDisplay('target_table', false);
}
