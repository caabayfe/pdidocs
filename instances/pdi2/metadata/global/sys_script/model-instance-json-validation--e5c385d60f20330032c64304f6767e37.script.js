(function executeRule(current, previous /*null when async*/) {
	if (!isValidJson(current.model_string)) {
		current.setAbortAction(true);
		current.model_string = previous.model_string;
		return;
	}
	
	var model = new sn_clotho.Data.fromModelString(current.model_string);
	var paramErrors = new sn_clotho.Data.validateModelParams(model);
	if (paramErrors.length > 0) {
		var errorString = paramErrors[0];
		for(var i = 1; i < paramErrors.length; i++)
			errorString += '\n' + paramErrors[i];

		gs.addErrorMessage(errorString);
		current.setAbortAction(true);
		current.model_string = previous.model_string;
	}

	function isValidJson(json) {
		try {
			JSON.parse(json);
			return true;
		} catch (e) {
			gs.addErrorMessage("Model String is not valid JSON. " + e);
			return false;
		}
	}

})(current, previous);
