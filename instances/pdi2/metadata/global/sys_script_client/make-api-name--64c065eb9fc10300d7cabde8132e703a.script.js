function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	var scope = g_scratchpad.scope;
	var text = newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
	scope = scope == 'global' ? '' : scope;
	if(scope != '')
		text = scope + "." + text;
	
	// Compact any multiple sequential underscores
	while (text.indexOf("__") != -1) {
		text = text.replace(/__/g, "_");
	}
	// Replace any trailing underscores
	while (text != '' && text.charAt(text.length - 1) == '_') {
		text = text.substring(0, text.length - 1);
	}
	
	g_form.setDisabled("api_name",false);
	g_form.setValue("api_name", text);
	g_form.setReadOnly("api_name",true);
}
