function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
		handleScriptDisplay(oldValue);
        return;
    }

	handleScriptDisplay(newValue);
	
	function handleScriptDisplay(subtype_Value) {
        g_form.setDisplay('script', subtype_Value === 'script');
    }

	// If script is selected and it is empty fill in the template
	if (newValue === 'script' && !g_form.getValue('script')) {
		var type = g_form.getValue('type');
		var scriptTemplate = '';
		if (type === 'policy') {
			scriptTemplate = '(function (username, ipAddress) {\n' +
			'\t// Make use of the arguments username and ipAddress to execute your own script and return one of the consent policies defined in sys_analytics_consent_policy:\n' +
			'\t// "Disabled", "Basic Tracking", "Explicit Opt In", "Notice" or "No Consent Required"\n' +
			'\treturn "";\n' +
			'})(username, ipAddress);';
		} else if (type === 'country') {
			scriptTemplate = '(function (username, ipAddress) {\n' +
			'\t// Make use of the arguments username and ipAddress to execute your own script and return a valid ISO2 country code.\n' +
			'\t// Such as "US", "UK" etc.\n' +
			'\treturn "";\n' +
			'})(username, ipAddress);';
		}
		g_form.setValue('script', scriptTemplate);
	}
}
