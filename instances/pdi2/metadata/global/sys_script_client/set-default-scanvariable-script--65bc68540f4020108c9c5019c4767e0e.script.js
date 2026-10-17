function onChange(control, oldValue, newValue, isLoading, isTemplate) {

	//don't run onload
	if (isLoading || newValue == "" || newValue == "false" || newValue == false)
		return;
	
	var defaultScript = "(function(/*ScanVariable*/ current, /*ScanVariables*/ variables) {\n\t// Generate a new value (String) for the current variable\n\n\treturn null;\n})(current, variables);";

	//set the script value if the box is checked and the script field is empty
	if ("" == g_form.getValue("template_execution_script"))
		g_form.setValue("template_execution_script", defaultScript);
}
