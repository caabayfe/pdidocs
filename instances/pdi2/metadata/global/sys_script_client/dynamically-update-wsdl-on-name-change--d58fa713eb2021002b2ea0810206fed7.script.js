function onLoad() {
	ScriptLoader.getScripts(['get_wsdl_url.js'], function() {});
	
	var scope = g_scratchpad.scope;
	if (scope == 'global')
		scope = '';
	
	// Dynamically update the WSDL every time a change is made to the name field
	var sys_web_service_name = g_form.getControl('name');
	sys_web_service_name.onkeyup = function() {
		g_form.setValue('wsdl', getWSDLUrl(scope));
	}
	
	// Call the function when the form is loaded to ensure the scope prefix shows up when application is read-only
	g_form.setValue('wsdl', getWSDLUrl(scope));
}
