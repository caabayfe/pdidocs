function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || !localStorage.triggerOnChange) {
		return;
	}
	var unsupportedType = ['11', '12', '14', '15', '17', '19', '20', '24', '25', '32', '33'];
	var clearValueTypes = ['25', '33'];
	var variableID = g_form.getValue("catalog_variable").substring(3);
	g_form.setDisplay("cleared", false);

	var gr = new GlideRecord("item_option_new");
	var exists = gr.get(variableID);
	var type = gr.getValue("type");
	if (exists && unsupportedType.includes(type)) {
		hideSetValue();
		if (clearValueTypes.includes(type)) //attachment and masked variable
			g_form.setDisplay("cleared", true);

	} else if (!exists) {  // variable sets
		hideSetValue();
		g_form.setDisplay("cleared", true);
	}
	else {
		showSetValue();
	}
}

function hideSetValue() {
	g_form.setMandatory("value", false);
	g_form.setDisplay("value_action", false);
	g_form.setDisplay("value", false);
	g_form.clearValue("value_action");
	g_form.clearValue("value");
}

function showSetValue() {
	g_form.setDisplay("value_action", true);
	if (g_form.getValue("value_action") === "set_value") {
		g_form.setDisplay("value", true);
		g_form.setMandatory("value", true);
	}
}
