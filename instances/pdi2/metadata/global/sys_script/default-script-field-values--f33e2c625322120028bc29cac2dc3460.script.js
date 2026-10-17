(function executeRule(current, previous /*null when async*/) {
	var description_generator = "function generateDescription() {\n    // the global variable 'step' represents the current glide record\n    var description = \"\";\n	// your code here\n	return description;\n}\n generateDescription();\n";
	var currDescription = current.description_generator.trim();
	if(!currDescription || currDescription == "") {
		current.description_generator = description_generator;
	}

	// Add the default step config scripts to g_scratchpad so they can be referenced in the "Generate default step config script" client script
	g_scratchpad.defaultStepConfigs = new ATFVariablesUtil().getDefaultStepConfigScriptsJSON();
})(current, previous);
