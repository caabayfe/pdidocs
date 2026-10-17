function onLoad() {
	ScriptLoader.getScripts(['scripts/get_wsdl_url.js?v=' + g_builddate], function() {
	
   var scope = g_scratchpad.scope;

	if (scope != 'global') 
		g_form.setDisplay('endpoint', true);
	else 
		g_form.setDisplay('endpoint', false);
	});
}
