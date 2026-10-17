function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var options = g_form.getControl('sort_on').options;
	if (!options)
		return;
	var customOrderExists = false;
	var defaultOrderExists = false;
	var indicatorGroupOrderExists = false;
	for (var i = 0; i < options.length; i++) {
		if (options[i].value === 'order') {
			customOrderExists = true;
		} else if (options[i].value === 'default') {
			defaultOrderExists = true;
		} else if (options[i].value === 'indicator_group') {
		    indicatorGroupOrderExists = true;
		}
	}

	var visualization = g_form.getValue('visualization');
	var timeRelative = (newValue == 'time' && visualization == 'relative');
	if (timeRelative || newValue == 'list') {
		var tagEl = gel('sys_display.pa_widgets.tag');
		var indicatorGroupSelected = tagEl && tagEl.value && tagEl.value.length > 0;
		if (indicatorGroupSelected) {
			if (customOrderExists)
				g_form.removeOption('sort_on', 'order');
			if (!indicatorGroupOrderExists) {
				g_form.addOption('sort_on', 'indicator group', 'Indicator group order');
				g_form.setValue('sort_on', 'indicator_group');
				g_form.setValue('sort_direction', 'asc');
			}
		} else {
			if (!customOrderExists)
				g_form.addOption('sort_on', 'order', 'Custom order');
			if (indicatorGroupOrderExists)
				g_form.removeOption('sort_on', 'indicator_group');
		}
	} else {
		if (indicatorGroupOrderExists) {
			g_form.clearValue('tag');
			g_form.removeOption('sort_on', 'indicator_group');
		}

		if (newValue == 'breakdown' || newValue == 'time' || newValue == 'score') {
			if (customOrderExists)
				g_form.removeOption('sort_on', 'order');
		}
	}

	if (newValue == 'breakdown') {
		if (!defaultOrderExists)
			g_form.addOption('sort_on', 'default', 'Default');
	} else {
		if (defaultOrderExists)
			g_form.removeOption('sort_on', 'default');
	}
}
