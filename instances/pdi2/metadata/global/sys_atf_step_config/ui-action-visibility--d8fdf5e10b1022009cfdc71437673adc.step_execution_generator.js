(function (step, stepResult, assertionObject) {

	var messages = getMessages([
		"Asserting UI action visibility",
		"Success: UI action '{0}' is visible",
		"Success: UI action '{0}' is not visible",
		"FAILURE: UI action '{0}' is visible",
		"FAILURE: UI action '{0}' is not visible",
		"Successfully asserted the following in '{0}':",
		"Failed while asserting the following in '{0}':",
		"Provide at least one UI action to assert as visible or not visible"
	]);

	assertionObject.executeStep = function(step, stepResult) {

	g_ui_testing_util.setTestStepStatusMessage(messages["Asserting UI action visibility"]);

	var retryCount = step.timeout;
	if (isNaN(retryCount))
		retryCount = 0;

	var afse = new ATFFormStepExecutor(step.inputs);
	afse.uiActionVisibility(retryCount).then(handleSuccess, handleFailure);
	
	function handleFailure(result) {
		var failMessage = "";
		if (typeof result === "string") // Legacy UI result
			failMessage = result;
		else if (result.message) // Caught exception
			failMessage = result.message;
		else // Workspace result
			failMessage = buildOutput(result.results);

		g_ui_testing_util.setTestStepStatusMessage(failMessage);
		stepResult.success = false;
		stepResult.message = failMessage;
		step.defer.reject();
	}
	
	function handleSuccess(result) {
		var message = "";
		if (typeof result === "string") // Legacy UI result
			message = result;
		else // Workspace result
			message = buildOutput(result.results);

		g_ui_testing_util.setTestStepStatusMessage(message);
		stepResult.success = true;
		stepResult.message = message;
		step.defer.resolve();
	}

	function buildOutput(results) {
		if (!results)
			return "";

		var message = "";

		results.forEach(function(result) {
			if (message.length > 0)
				message += '\n';

			if (result.isVisible && result.shouldBeVisible)
				message += formatMessage(messages["Success: UI action '{0}' is visible"], result.label);
			else if (!result.isVisible && !result.shouldBeVisible)
				message += formatMessage(messages["Success: UI action '{0}' is not visible"], result.label);
			else if (result.isVisible && !result.shouldBeVisible)
				message += formatMessage(messages["FAILURE: UI action '{0}' is visible"], result.label);
			else
				message += formatMessage(messages["FAILURE: UI action '{0}' is not visible"], result.label);
		});

		return message;
	}

	};	
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
