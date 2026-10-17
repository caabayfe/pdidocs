(function (step, stepResult, assertionObject) {

	var messages = getMessages([
		"Opening an existing record",
		"Successfully opened the '{0}' view of the '{1}' form with id '{2}'",
		"FAILURE: Failed to open the '{0}' view of the '{1}' form with id '{2}'",
		"Successfully opened the '{0}' form with id '{1}'",
		"FAILURE: Failed to open the '{0}' form with id '{1}'",
		"Successfully opened the '{0}' form with id '{1}' in '{2}'",
		"FAILURE: Failed to open the '{0}' form with id '{1}' in '{2}'",
		"Table '{0}' does not have a record with id '{1}'",
		"A sys_id was expected, however none was present. Please ensure that you are passing in the document id correctly",
		"Error validating view by calling TestExecutorAjax.validateFormView",
		"View '{0}' does not exist on the table '{1}'",
		"Table '{0}' does not exist",
		"The form failed to load"
	]);

	g_ui_testing_util.setTestStepStatusMessage(messages["Opening an existing record"]);

	assertionObject.executeStep = function(step, stepResult) {
		var afse = new ATFFormStepExecutor(step.inputs);
		afse.openExistingRecord().then(onSuccess, onFailure);

		function onSuccess(result) {
			var message;

			if (typeof result === "string") // Standard UI result is just a string (already translated)
				message = result;
			else // Workspace result is an object
				message = formatMessage(messages["Successfully opened the '{0}' form with id '{1}' in '{2}'"], step.inputs.table, step.inputs.record_id, step.inputs.workspace_display_name);

			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
		}

		function onFailure(result) {
			var message;

			if (typeof result === "string") // Standard UI result is just a string (already translated)
				message = result;
			else {
				if (result.reason === "no_sys_id")
					message = formatMessage(messages["A sys_id was expected, however none was present. Please ensure that you are passing in the document id correctly"]);
				else if (result.reason === "ajax_error")
					message = messages["Error validating view by calling TestExecutorAjax.validateFormView"];
				else if (result.reason === "invalid_table")
					message = formatMessage(messages["Table '{0}' does not exist"], step.inputs.table);
				else if (result.reason === "invalid_sys_id")
					message = formatMessage(messages["Table '{0}' does not have a record with id '{1}'"], step.inputs.table, step.inputs.record_id);
				else if (result.message) // Could also be a caught exception
					message = result.message;
				else // If none of the above applies, use a default message
					message = formatMessage(messages["FAILURE: Failed to open the '{0}' form with id '{1}' in '{2}'"], step.inputs.table, step.inputs.record_id, step.inputs.workspace_display_name);
			}

			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
