function onLoad() {
	ScriptLoader.getScripts(['get_table_name.js'], function() {});
	
	g_form.getControl('label').onkeyup = function() {
		var scope = g_scratchpad.scope;
		if (scope == 'global')
			scope = '';
		g_form.setValue('name', getTableName(scope));
	}
}
