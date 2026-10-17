function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}

	ScriptLoader.getScripts(['generate_table_name_with_scope.js'], function() {
	    var scope = g_scratchpad.scope;
		scope = scope == 'global' ? '' : scope;
		
	    setTableNameFromNewScope(g_form, g_scratchpad, scope);
	});
}

function setTableNameFromNewScope(form, scratchpad, scope) {
	var value = form.getValue('name');

	var newName = generateTableNameFromName(value, scope);

	var control = form.getControl('name');
	var updated = setTableNameInControl(control, newName);
}
