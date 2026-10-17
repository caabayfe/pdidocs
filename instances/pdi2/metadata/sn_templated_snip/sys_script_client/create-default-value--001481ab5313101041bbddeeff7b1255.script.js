function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {
		var dbNameSanitizer = new DBNameSanitizer();
		var value = dbNameSanitizer.trimName(newValue);
		g_form.setValue("value", value);
	});   
}
