function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}

	var views;
	try {
		views = JSON.parse(g_scratchpad.pa_database_views);
	} catch (err) {
		views = g_scratchpad.pa_database_views.evalJSON();
	}

	// g_form.isReadOnly does not work in case of scoped app fields
	var editableFields = g_form.getEditableFields();
	var isReadOnly = (editableFields.indexOf("facts_table") == -1);

	var factsTableFieldName = 'facts_table';
	var factsTableFieldValue = g_form.getValue(factsTableFieldName);

	if (!isReadOnly && views[factsTableFieldValue]) {
		var pkTableFieldName = 'facts_table_pktable';
		var pkViewName = 'facts_table_pkview';

		var pkTableFieldValue = g_form.getValue(pkTableFieldName);
		var pkViewValue = g_form.getValue(pkViewName);

		var tables = views[factsTableFieldValue];

		// Set List View select options
		g_form.clearOptions(pkViewName);

		var vi = 0;
		var optionSelected = -1;
		var tableViews = tables[newValue];
		for (var listView in tableViews) {
			g_form.addOption(pkViewName, tableViews[listView], listView);
			if (tableViews[listView] == pkViewValue)
				optionSelected = vi;
			vi++;
		}
		if (optionSelected > -1) {
			var viewSelectBox = g_form.getControl(pkViewName);
			viewSelectBox.options[optionSelected].selected = true;
		}
	}
}
