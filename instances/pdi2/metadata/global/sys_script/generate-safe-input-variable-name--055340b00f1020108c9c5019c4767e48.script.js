(function executeRule(current, previous /*null when async*/) {

	// If the name is changed for any reason a info message will be displayed to the user, as well as, logged.
	var templateAPI = new sn_templates.TemplateScriptableAPI();
	var cleanVarName = templateAPI.generateCleanFlowVariableName(current.name);

	if (cleanVarName !== current.getValue('name')) {	
		// Inform the user that a change in the variable name was made.
		var infoMessage = gs.getMessage("Template Input Variable name was modified. new name: '{0}', previous name: '{1}'", [cleanVarName, current.name]);
		gs.addInfoMessage(infoMessage);

		// Set the name to be the clean variable name.
		current.name = cleanVarName;
	}
	
})(current, previous);
