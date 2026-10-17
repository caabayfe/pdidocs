function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	//Set the default script template if the user changes the type
	//and the current script is the default for the *other* type
	
	var defaultRecordScript = "(function(/*GlideRecord*/ current, /*ScanVariables*/ variables) {\n	//Create your XML document (see documentation for XMLDocument2) and return the String representation\n\n})(current, variables);";
	var defaultFieldScript = "(function(/*GlideRecord*/ current, /*String*/ field, /*ScanVariables*/ variables) {\n	//Return the string value for this field\n\n})(current, field, variables);";

	if (newValue == "table") {
		if (g_form.getValue("script") == defaultFieldScript)
			g_form.setValue("script", defaultRecordScript);
	}
	
	if (newValue == "field") {
		if (g_form.getValue("script") == defaultRecordScript)
			g_form.setValue("script", defaultFieldScript);
	}
}
