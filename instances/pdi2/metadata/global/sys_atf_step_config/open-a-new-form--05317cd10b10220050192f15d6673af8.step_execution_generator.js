(function (step, stepResult, assertionObject) {

	var messages = getMessages([
		"Opening a new form",
		"Successfully opened the '{0}' view of a new '{1}' form",
		"Successfully opened a new '{0}' form",
		"Successfully opened a new '{0}' form in '{1}'",
		"FAILURE: Failed to open the '{0}' view of a new '{1}' form",
		"FAILURE: Failed to open a new '{0}' form",
		"FAILURE: Failed to open a new '{0}' form in '{1}'",
		"Error validating view by calling TestExecutorAjax.validateFormView",
		"View '{0}' does not exist on the table '{1}'",
		"Table '{0}' does not exist",
		"The form failed to load"
	]);

	g_ui_testing_util.setTestStepStatusMessage(messages["Opening a new form"]);

	assertionObject.executeStep = function(step, stepResult) {
		var afse = new ATFFormStepExecutor(step.inputs);
		afse.openNewForm().then(onSuccess, onFailure);

		function onSuccess(result) {
			var message;

			// Standard UI result is just a string (already translated)
			if (typeof result === "string")
				message = result;
			else // Workspace result is an object
				message = formatMessage(messages["Successfully opened a new '{0}' form in '{1}'"], step.inputs.table, step.inputs.workspace_display_name);

			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
		}

		function onFailure(result) {
			var message;

			// Standard UI result is just a string (already translated)
			if (typeof result === "string")
				message = result;
			else {
				// The result could be an error, or a failure object with the failure reason
				if (result.reason === "ajax_error")
					message = messages["Error validating view by calling TestExecutorAjax.validateFormView"];
				else if (result.reason === "invalid_table")
					message = formatMessage(messages["Table '{0}' does not exist"], step.inputs.table);
				else if (result.message) // Could also be a caught exception
					message = result.message;
				else // If none of the above apply, use a default message
					message = formatMessage(messages["FAILURE: Failed to open a new '{0}' form in '{1}'"], step.inputs.table, step.inputs.workspace_display_name);
			}

			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		}
	};

	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
