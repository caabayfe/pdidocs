function onLoad() {
	//Set up default scripts
	
	if (!g_form.isNewRecord())
		return;
	
	var defaultRecordScript = "(function(/*GlideRecord*/ current, /*ScanVariables*/ variables) {\n	//Create your XML document (see documentation for XMLDocument2) and return the String representation\n\n})(current, variables);";

	var defaultFieldScript = "(function(/*GlideRecord*/ current, /*String*/ field, /*ScanVariables*/ variables) {\n	//Return the string value for this field\n\n})(current, field, variables);";
	
	if ("" == g_form.getValue("script")) {
		if (g_form.getValue("type") == "table")
			g_form.setValue("script", defaultRecordScript);

		if (g_form.getValue("type") == "field")
			g_form.setValue("script", defaultFieldScript);
	}
	
	
}
