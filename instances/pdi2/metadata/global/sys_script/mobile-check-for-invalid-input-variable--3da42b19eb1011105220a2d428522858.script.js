(function executeRule(current, previous /*null when async*/) {
	var inputsInTemplate = current.template.match(/Input: (.*?)(?=\}\})/g);
	var variablesInTemplate = current.template.match(/Variable: (.*?)(?=\}\})/g);

	var parameterScreen = new GlideRecord("sys_sg_parameter_screen");
	parameterScreen.query();
	parameterScreen.get(current.parameter_screen);

	var variablesOnParameterScreen = new GlideRecord("sys_sg_variable");
			variablesOnParameterScreen.addQuery("parameter_screen", current.parameter_screen);
			variablesOnParameterScreen.query();

	var inputsOnParameterScreen = new GlideRecord("sys_sg_input");
			inputsOnParameterScreen.addQuery("parameter_screen", current.parameter_screen);
			inputsOnParameterScreen.query();

	if(inputsInTemplate) {
		for (var i = 0; i < inputsInTemplate.length; i++) {
			var currInput = inputsInTemplate[i].substring(inputsInTemplate[i].indexOf(" ") + 1);
			var dotIndex = currInput.indexOf(".");
			if (dotIndex != -1)
				checkInputOnSection(currInput.substring(0, dotIndex), currInput.substring(dotIndex + 1), parameterScreen);
			else if (!inputsOnParameterScreen.get("name", currInput)) {
				printErrorMessage(parameterScreen.getValue("name"), parameterScreen.getUniqueValue(), currInput, "input");
			}
		}
	}

	if (variablesInTemplate) {
		for (i = 0; i < variablesInTemplate.length; i++) {
			var currVariable = variablesInTemplate[i].substring(variablesInTemplate[i].indexOf(" ") + 1);
			dotIndex = currVariable.indexOf(".");
			if (dotIndex != -1)
				checkVariableOnSection(currVariable.substring(0, dotIndex), currVariable.substring(dotIndex + 1), parameterScreen);
			else if (!variablesOnParameterScreen.get("name", currVariable)) {
				printErrorMessage(parameterScreen.getValue("name"), parameterScreen.getUniqueValue(), currVariable, "variable");
			}
		}
	}
})(current, previous);

function getParameterSectionId(sectionName) {
	var sectionMapping = new GlideRecord("sys_sg_parameter_section_m2m");
	sectionMapping.get("name", sectionName);
	if (!sectionMapping) return null;
	return sectionMapping.getValue("parameter_section");
}

function checkInputOnSection(sectionName, inputName, parameterScreen) {
	var parameterSectionId = getParameterSectionId(sectionName);
	if (!parameterSectionId) return;

	var inputsOnSection = new GlideRecord("sys_sg_input");
	inputsOnSection.addQuery("parameter_section", parameterSectionId);
	var found = inputsOnSection.get("name", inputName);
	if (!found) {
		printErrorMessage(parameterScreen.getValue("name"), parameterScreen.getUniqueValue(), inputName, "input");
	}
}

function checkVariableOnSection(sectionName, variableName, parameterScreen) {
	var parameterSectionId = getParameterSectionId(sectionName);
	if (!parameterSectionId) return;

	var inputsOnSection = new GlideRecord("sys_sg_variable");
	inputsOnSection.addQuery("parameter_section", parameterSectionId);
	var found = inputsOnSection.get("name", variableName);
	if (!found) {
		printErrorMessage(parameterScreen.getValue("name"), parameterScreen.getUniqueValue(), variableName, "variable");
	}
}

function printErrorMessage(paramScreenName, paramScreenSysId, name, type) {
	gs.addErrorMessage("Parameter Screen " +
										paramScreenName +
										" (sys id: " + paramScreenSysId +
										") has invalid " + type + ": " +
										name
										);
}
