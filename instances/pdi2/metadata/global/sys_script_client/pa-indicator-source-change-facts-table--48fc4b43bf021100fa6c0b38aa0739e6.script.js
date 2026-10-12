function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '')
		return;

	var dbViews = parseJSON(g_scratchpad.pa_database_views);

	var pkTableFieldName = 'facts_table_pktable';
	var pkViewName = 'facts_table_pkview';

	var pkViewValue = g_form.getValue(pkViewName);

	// g_form.isReadOnly does not work in case of scoped app fields
	var editableFields = g_form.getEditableFields();
	var isReadOnly = (editableFields.indexOf("facts_table") == -1);

	if (!isReadOnly && dbViews[newValue]) {

		var pkTableFieldValue = g_form.getValue(pkTableFieldName);

		var tables = dbViews[newValue];

		g_form.setDisplay(pkTableFieldName, true);
		g_form.clearOptions(pkTableFieldName);

		var i = 0;
		var pkTableFieldValueSelected = null;
		for (var table in tables) {
			g_form.addOption(pkTableFieldName, table, table);
			if (i == 0) {
				selectedTable = table;
				pkTableFieldValueSelected = i;
			}
			if (table === pkTableFieldValue) {
				selectedTable = table;
				pkTableFieldValueSelected = i;
			}
			i++;
		}
		if (isLoading && pkTableFieldValue.length > 0 && pkTableFieldValueSelected === null) {
			// nothing found. this could be a value entered before we introduced the select box
			g_form.addOption(pkTableFieldName, pkTableFieldValue, pkTableFieldValue);
			selectedTable = pkTableFieldValue;
			pkTableFieldValueSelected = i;
		}

		var tableSelectBox = g_form.getControl(pkTableFieldName);
		tableSelectBox.options[pkTableFieldValueSelected || 0].selected = true;

		var views = tables[selectedTable];
		addListViews(views);
	} else {
		// This is not a database view, hide the table field.
		g_form.setDisplay(pkTableFieldName, false);

		// Fetch the table views for the facts table
		var aj = new GlideAjax('PAAjax');
		aj.addParam('sysparm_name', 'getTableListViews');
		aj.addParam('sysparm_value', newValue);
		aj.getXML(function (response) {
			var views = parseJSON(response.responseXML.documentElement.getAttribute('views'));
			addListViews(views);
		});
	}

	function addListViews (views) {
		// Set List View select options
		g_form.clearOptions(pkViewName);

		var vi = 0;
		var optionSelected = -1;
		for (var view in views) {
			g_form.addOption(pkViewName, views[view], view);
			if (views[view] === pkViewValue)
				optionSelected = vi;
			vi++;
		}
		if (optionSelected > -1) {
			var viewSelectBox = g_form.getControl(pkViewName);
			viewSelectBox.options[optionSelected].selected = true;
		}
	}

	function parseJSON (json) {
		var object;
		try {
			object = JSON.parse(json);
		} catch (err) {
			object = json.evalJSON();
		}
		return object;
	}
}
