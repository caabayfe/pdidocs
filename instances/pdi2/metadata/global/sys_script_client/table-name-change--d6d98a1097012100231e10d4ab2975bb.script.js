function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;
	
	ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {
		var tableName = g_form.getValue('name');
		var appId = new DBNameSanitizer().getCurrentOrTableAppId(tableName);		
		g_form.setValue('sys_scope', appId);
	});
}
	
