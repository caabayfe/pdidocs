function onLoad() {
	if (g_form.isNewRecord())
		return;

	if (g_scratchpad.currentChoices) {
		var currentValue = g_form.getValue('value');

		var choices = JSON.parse(g_scratchpad.currentChoices);

		g_form.clearOptions('value');
		for (var i = 0; i < choices.length; i++) {
			var choice = choices[i];
			if (choice.label)
				g_form.addOption('value', choice.value, choice.label);
		}
		
		g_form.setValue('value', currentValue);
	}
}
