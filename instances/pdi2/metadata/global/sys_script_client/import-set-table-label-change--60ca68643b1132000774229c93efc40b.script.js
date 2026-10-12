function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	ScriptLoader.getScripts(['generate_table_name_with_scope.js'], function() {
	    var scope = g_scratchpad.scope;
		scope = scope == 'global' ? '' : scope;
		
	    setTableNameFromLabel(g_form, g_scratchpad, scope, newValue);
	});
}

function setTableNameFromLabel(form, scratchpad, scope, value) {
	var name = form.getValue('import_set_table_name');

	//If user chose a name with the proper scope, don't override it
	if (scratchpad.userSelectedName && name.indexOf(scope) == 0)
		return;

	var newName;
	if (scratchpad.userSelectedName)
		newName = generateTableNameFromLabel(name, scope);
	else
		newName = generateTableNameFromLabel(value, scope);

	var control = g_form.getControl('import_set_table_name');
	var updated = setTableNameInControl(control, newName);
	if (updated)
		scratchpad.generatedName = newName;
}
