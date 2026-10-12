function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var options = g_form.getControl('sort_on').options;
	if (!options)
		return;
	var customOrderExists = false;
	var indicatorGroupOrderExists = false;
	for (var i = 0; i < options.length; i++) {
		if (options[i].value === 'order') {
			customOrderExists = true;
		} else if (options[i].value === 'indicator_group') {
			indicatorGroupOrderExists = true;
		}
	}


	var type_value = g_form.getValue('type');
	var show_relative = (type_value == 'time' && g_form.getValue('visualization') == 'relative');
	if ((type_value == 'list' && newValue.length == 0) || show_relative) {
		g_form.showRelatedList('REL:2e434d10d7213100757a4251ce610331_list');
		if (!customOrderExists)
			g_form.addOption('sort_on', 'order', 'Custom order');
		if (indicatorGroupOrderExists)
			g_form.removeOption('sort_on', 'indicator_group');
	} else {
		var show_compare = (type_value == 'time' && g_form.getValue('visualization') != 'relative' && g_form.getValue('is_compare_chart') == 'true');
		if (show_compare)
			g_form.hideRelatedList('REL:2e434d10d7213100757a4251ce610331_list');
		else
			g_form.showRelatedList('REL:2e434d10d7213100757a4251ce610331_list');
		if (customOrderExists)
			g_form.removeOption('sort_on', 'order');
		if (!indicatorGroupOrderExists) {
			g_form.addOption('sort_on', 'indicator_group', 'Indicator group order');
			g_form.setValue('sort_on', 'indicator_group');
			g_form.setValue('sort_direction', 'asc');
		}
	}
}
