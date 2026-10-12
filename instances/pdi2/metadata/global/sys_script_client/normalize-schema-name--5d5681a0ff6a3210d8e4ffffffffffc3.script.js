function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}

	ScriptLoader.getScripts(['normalize_ws_schema_name.js'], function() {
		normalizeNewName(g_form, newValue);
	});
}

function normalizeNewName(form, newName) {
	var schemaName = form.getValue('name');
	
	var newSchemaName = normalizeSchemaName(newName);
	var control = form.getControl('name');
	control.value = newSchemaName;
}
