function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || !localStorage.triggerOnChange) {
		return;
	}
	var unsupportedType = ['11', '12', '14', '15', '17', '19', '20', '24', '32'];
	var variableID = g_form.getValue("catalog_variable").substring(3);

	var gr = new GlideRecord("item_option_new");
	var exists = gr.get(variableID);
	var type = gr.getValue("type");
	if (exists && unsupportedType.includes(type)) {
		hideFieldMessage();
	} else {
		showFieldMessage();
	}
}

function hideFieldMessage() {
	g_form.setMandatory("field_message", false);
	g_form.setDisplay("field_message_type", false);
	g_form.setDisplay("field_message", false);
	g_form.clearValue("field_message_type");
	g_form.clearValue("field_message");
}

function showFieldMessage() {
	g_form.setDisplay("field_message_type", true);
	if (g_form.getValue("field_message_type") !== "none" ) {
		g_form.setDisplay("field_message", true);
		g_form.setMandatory("field_message", true);
	}
}
