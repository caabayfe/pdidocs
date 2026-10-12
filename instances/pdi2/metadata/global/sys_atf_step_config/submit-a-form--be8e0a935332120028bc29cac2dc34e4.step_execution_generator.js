(function (step, stepResult, assertionObject) {

	var messages = getMessages([
		"Save",
		"Submit",
		"Submitting a form",
		"Submitting a form in '{0}'",
		"Checking if form submit was successful",
		"Attempted form submit in '{0}'.",
		"FAILURE: page could not reload in time after completion of submit",
		"FAILURE: Cannot submit form. There is no form currently open",
		"FAILURE: could not find sysId of newly created record",
		"FAILURE: Cannot submit '{0}' form. No submit actions available. Only the 'Save' and 'Submit' actions are currently supported",
		"FAILURE: Submission of '{0}' form using the '{1}' action was aborted before being sent to the server",
		"FAILURE: Submission of '{0}' form using the '{1}' button was aborted before being sent to the server",
		"FAILURE: Browser failed to block submission of '{0}' form to server using '{1}' action",
		"FAILURE: Browser failed to block submission of '{0}' form to server using '{1}' button",
		"Successfully confirmed that browser blocks submission of '{0}' form to server using '{1}' action",
		"Successfully confirmed that browser blocks submission of '{0}' form to server using '{1}' button",
		"Successfully submitted '{0}' form for record with sys_id '{2}' using the '{1}' action",
		"Successfully submitted '{0}' form for record with sys_id '{2}' using the '{1}' button",
		"FAILURE: Failed to submit '{0}' form using the '{1}' action",
		"FAILURE: Failed to submit '{0}' form using the '{1}' button",
		"Successfully used '{0}' action on '{1}' form",
		"Successfully used '{0}' button on '{1}' form"
	]);

	assertionObject.executeStep = function(step, stepResult) {
		g_ui_testing_util.setTestStepStatusMessage(messages["Submitting a form"]);

		var afse = new ATFFormStepExecutor(step.inputs);
		afse.submitForm(step.timeout).then(passStep, failStep);

		function passStep(promiseReturn) {
			var message = promiseReturn['msg'];

			// The keys used for the return values can vary depending on which API is called
			var recordSysId = promiseReturn.recordSysId || promiseReturn.sysId;
			var formTable = promiseReturn.formTable || promiseReturn.table;

			// Handle workspace result
			if (!message) {
				var action = messages[promiseReturn.action];

				if (step.inputs.assert_type === "form_submitted_to_server")
					message = formatMessage(messages["Successfully submitted '{0}' form for record with sys_id '{2}' using the '{1}' action"], formTable, action, recordSysId);
				else if (step.inputs.assert_type === "form_submission_canceled_in_browser")
					message = formatMessage(messages["Successfully confirmed that browser blocks submission of '{0}' form to server using '{1}' action"], formTable, action);
				else
				message = formatMessage(messages["Successfully used '{0}' action on '{1}' form"], action, formTable);
			}

			stepResult.outputs.table = formTable;
			if (recordSysId && recordSysId != "-1")
				stepResult.outputs.record_id = recordSysId;

			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
		}

		function failStep(result) {
			var message = "";
			if (typeof result === "string") // Legacy result
				message = result;
			else if (result.message) // Conventional error
				message = result.message;
			else { // Configurable workspace result
				var table = result.table;
				var action = result.action;

				if (step.inputs.assert_type === "form_submitted_to_server")
					message = formatMessage(messages["FAILURE: Submission of '{0}' form using the '{1}' action was aborted before being sent to the server"], table, action);
				else if (step.inputs.assert_type === "form_submission_canceled_in_browser")
					message = formatMessage(messages["FAILURE: Browser failed to block submission of '{0}' form to server using '{1}' action"], table, action);
				else
					message = formatMessage(messages["FAILURE: Failed to submit '{0}' form using the '{1}' action"], table, action);
			}

			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
