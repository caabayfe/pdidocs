(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {

		var messages = getMessages([
			"Validating field states",
			"FAILURE: Unable to perform field state validation because g_form is not defined. A valid form must be open before running assertions",
			"FAILURE: Unable to check if field '{0}' is {1}. That field is not present on the form",
			"FAILURE: Expected field '{0}' to be {1} but it was not {2}",
			"FAILURE: Expected field '{0}' to not be {1} but it was {2}",
			"FAILURE: Type of the form on the page is incorrect",
			"Successfully validated all field states",
			"Successfully validated all field states in '{0}'",
			"Failed while validating the following states in '{0}':"
		]);

		assertionObject.canMutatePage = step.can_mutate_page;

		var formStepExecutor = new ATFFormStepExecutor(step.inputs);
		formStepExecutor.validateFieldState(step.timeout).then(handleSuccess, handleFailure);  // retryCount

		function handleFailure(result) {
			var failMessage = "";

			if (typeof result === "string") // Legacy UI result
				failMessage = result;
			else if (result.message) // Conventional error
				failMessage = result.message;
			else { // Workspace result
				var failures = result.failures;

				failMessage = "";
				failMessage = appendFailures(failMessage, failures.mandatory, "mandatory", true);
				failMessage = appendFailures(failMessage, failures.not_mandatory, "mandatory", false);
				failMessage = appendFailures(failMessage, failures.read_only, "read-only", true);
				failMessage = appendFailures(failMessage, failures.not_read_only, "read-only", false);
				failMessage = appendFailures(failMessage, failures.visible, "visible", true);
				failMessage = appendFailures(failMessage, failures.not_visible, "visible", false);
			}

			g_ui_testing_util.setTestStepStatusMessage(failMessage);
			stepResult.success = false;
			stepResult.message = failMessage;
			step.defer.reject();
		}

		function handleSuccess(message) {
			if (typeof message !== "string") // Workspace result
				message = messages["Successfully validated all field states"];

			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
		}

		function appendFailures(message, failures, property, expectedValue) {
			if (!failures)
				return message;

			failures.forEach(function(fieldName) {
				if (message.length > 0)
					message += "\n";

				if (expectedValue)
					message += formatMessage(messages["FAILURE: Expected field '{0}' to be {1} but it was not {2}"], fieldName, property, property);
				else
					message += formatMessage(messages["FAILURE: Expected field '{0}' to not be {1} but it was {2}"], fieldName, property, property);
			});

			return message;
		}

	};
})(step, stepResult, assertionObject);
