(function (step, stepResult, assertionObject) {

	var messages = getMessages([
		"Performed the following in '{0}':",
		"Setting field values",
		"FAILURE: Unable to set values, g_form is not defined. A valid form must be open before setting values",
		"ERROR: Unable to decode field values from server",
		"Skipping setting a value, no field or value was given",
		"Skipping setting field to value '{0}', no field was given",
		"FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not editable",
		"FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not present on the form",
		"Successfully set field '{0}' to value '{1}'",
		"Successfully set field '{0}' to valid reference value '{1}'",
		"FAILURE: Failed to set field '{0}' to value '{1}' because the reference is NOT valid",
		"FAILURE: Unable to set field '{0}' to value '{1}'. Value '{1}' is not currently a valid choice"
	]);

  assertionObject.executeStep = function(step, stepResult) {
	g_ui_testing_util.setTestStepStatusMessage(messages["Setting field values"]);

	new ATFFormStepExecutor(step.inputs)
		.setFieldValues(step.timeout)
		.then(passStep, failStep);

	function passStep(result) {
		var message = "";

		if (typeof result === "string") // Legacy UI result
			message = result;
		else // Workspace result
			message = buildOutput(result.fieldValues);

		stepResult.message = message;
		g_ui_testing_util.setTestStepStatusMessage(message);
		stepResult.success = true;
		step.defer.resolve();
	}

	function failStep(result) {
		var reason = "";

		if (typeof result === "string") // Legacy UI result
			reason = result;
		else if (result.fieldValues) // Workspace result
			reason = buildOutput(result.fieldValues);
		else if (result.reason === "decode_field_values_error") // Decode field values error
			reason = messages["ERROR: Unable to decode field values from server"];
		else if (result.message) // Some other error was thrown
			reason = result.message;

		stepResult.message = reason;
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = false;
		step.defer.reject();
	}

	function buildOutput(fieldValues) {
		if (!fieldValues)
			return "";

		var result = "";

		fieldValues.forEach(function(fieldValue) {
			if (result.length > 0)
				result += '\n';

			if (fieldValue.success)
				result += formatMessage(messages["Successfully set field '{0}' to value '{1}'"], fieldValue.field, fieldValue.value);
			else if (fieldValue.reason === "field_not_present")
				result += formatMessage(messages["FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not present on the form"], fieldValue.field, fieldValue.value);
			else if (fieldValue.reason === "read_only")
				result += formatMessage(messages["FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not editable"], fieldValue.field, fieldValue.value);
		});

		return result;
	}

  };
  assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
