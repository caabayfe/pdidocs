function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === 'Certificates') {
		g_form.removeOption('mid_select_method', 'behavior');
	} else {
		// make sure 'Use Behavior option exists'
		var midSelectOptions = g_form.getControl('mid_select_method') && g_form.getControl('mid_select_method').options;
		if (!midSelectOptions)
			return;

		var foundBehaviorChoice = false;
		var i, option;
		for (i = 0; i < midSelectOptions.length; i++) {
			option = midSelectOptions[i];
			if (option.value === 'behavior')
				foundBehaviorChoice = true;
		}

		if (!foundBehaviorChoice)
			g_form.addOption('mid_select_method', 'behavior', 'Use Behavior');

	}
}
