function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}

	ScriptLoader.getScripts(['generate_table_name_with_scope.js'], function() {
	    var scope = g_scratchpad.scope;
		scope = scope == 'global' ? '' : scope;
		
	    setTableNameFromNewName(g_form, scope, newValue);
	});
}

function setTableNameFromNewName(form, scope, value) {
	if (value == null || value == '') {
		// Value is empty.  Try recreating from label.
		value = form.getValue('label');
	}

	var newName = generateTableNameFromName(value, scope);

	var control = form.getControl('name');
	setTableNameInControl(control, newName);
}
