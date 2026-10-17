function onLoad() {
	var targetTable = g_form.getValue('target_table');
	var appliesTo = g_form.getValue('applies_to');
	var choices = g_scratchpad.target_table_choices[appliesTo];

	// Clear existing options
	g_form.clearOptions('target_table');

	for (var i = 0; i < choices.length; i++) {
		g_form.addOption('target_table', choices[i].name, choices[i].label + ' [' + choices[i].name + ']');
	}

	if (targetTable !== '') {
		g_form.setValue('target_table', targetTable);
	}

	if (choices.length > 1) {
		g_form.setDisplay('target_table', true);
	} else {
		g_form.setDisplay('target_table', false);
	}
}
