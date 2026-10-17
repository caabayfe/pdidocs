function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   //Type appropriate comment here, and begin script below
	if (isLoading) {
		ScriptLoader.getScripts(['get_table_name.js'], function() {});
		return;
	}

	// Call the function when the form is loaded to ensure the scope prefix shows up when application is read-only
	var scope = g_scratchpad.scope;
	if (scope == 'global')
		scope = '';
	g_form.setValue('name', getTableName(scope));
}
