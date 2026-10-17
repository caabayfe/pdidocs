function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}

	ScriptLoader.getScripts(['generate_table_name_with_scope.js'], function() {
	    var scope = g_scratchpad.scope;
		scope = scope == 'global' ? '' : scope;
		
	    setTableNameFromNewName(g_form, g_scratchpad, scope, newValue);
	});
}

function setTableNameFromNewName(form, scratchpad, scope, value) {
	if (value == null || value == '') {
		// Value is empty.  Try recreating from label.
		value = form.getValue('label');
	}

	var newName = generateTableNameFromName(value, scope);

	var control = form.getControl('name');
	var updated = setTableNameInControl(control, newName);
	/* Mark it as user selected when generated name is not same as new value */
	if (updated && scratchpad.generatedName != target.value)
		scratchpad.userSelectedName = true;
}
