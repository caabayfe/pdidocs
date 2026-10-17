function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}

	ScriptLoader.getScripts(['get_wsdl_url.js'], function() {
		// Call the function when the form is loaded to ensure the scope prefix shows up when application is read-only
		var scope = g_scratchpad.scope;
		if (scope == 'global')
			scope = '';
		g_form.setValue('wsdl', getWSDLUrl(scope));
	});
}
