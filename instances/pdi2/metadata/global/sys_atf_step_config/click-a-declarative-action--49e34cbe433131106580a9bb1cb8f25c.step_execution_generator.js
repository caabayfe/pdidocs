(function (step, stepResult, assertionObject) {

	var messages = getMessages([
		"Clicking a declarative action",
		"FAILURE: Cannot submit '{0}' form. There is no form currently open",
		"FAILURE: Cannot submit '{0}' form in '{1}'. There is no form currently open",
		"FAILURE: Failed to find declarative action '{0}' on '{1}' form",
		"FAILURE: Failed to find declarative action '{0}' on '{1}' form in '{2}'",
		"Successfully confirmed that browser submits '{0}' form to server when clicking declarative action '{1}'",
		"Successfully confirmed that browser submits '{0}' form to server when clicking declarative action '{1}' in '{2}'",
		"FAILURE: Browser failed to block submission of '{0}' form to server when clicking declarative action '{1}'",
		"FAILURE: Browser failed to block submission of '{0}' form to server when clicking declarative action '{1}' in '{2}'",
		"Successfully clicked declarative action '{0}' on '{1}' form",
		"Successfully clicked declarative action '{0}' on '{1}' form in '{2}'",
		"FAILURE: Declarative action not defined in the step",
		"Successfully confirmed that browser blocks submission of '{0}' form to server when clicking declarative action '{1}'",
		"Successfully confirmed that browser blocks submission of '{0}' form to server when clicking declarative action '{1}' in '{2}'",
		"FAILURE: Browser failed to submit '{0}' form to server when clicking declarative action '{1}'",
		"FAILURE: Browser failed to submit '{0}' form to server when clicking declarative action '{1}' in '{2}'",
		"Successfully confirmed that '{0}' form is reloaded or redirected when clicking declarative action '{1}'",
		"Successfully confirmed that '{0}' form is reloaded or redirected when clicking declarative action '{1}' in '{2}'",
		"FAILURE: '{0}' form is not reloaded or redirected when clicking declarative action '{1}'",
		"Waiting up to {0} seconds for form submit or page reload",
		"FAILURE: Page could not reload in time after completion of declarative action in '{0}'",
		"FAILURE: Unknown error clicking declarative action: '{0}'"
	]);

	assertionObject.executeStep = function(step, stepResult) {

	g_ui_testing_util.setTestStepStatusMessage(messages["Clicking a declarative action"]);

	// Create a new ATF Form/UI step executor object and call the function to execute step
	var afse = new ATFFormStepExecutor(step.inputs);
	afse.clickUIAction(step.timeout).then(passStep, failStep);

	function passStep(promiseReturn) {

		var message = promiseReturn['msg'];
		var recordSysId = promiseReturn['sysId'];
		var formTable = promiseReturn['table'];

		if (!message) { // Configurable workspace result
			if (step.inputs.assert_type === "form_submitted_to_server")
				message = formatMessage(messages["Successfully confirmed that browser submits '{0}' form to server when clicking declarative action '{1}'"],  step.inputs.table, step.inputs.ui_action.name);
			else if (step.inputs.assert_type === "form_submission_canceled_in_browser")
				message = formatMessage(messages["Successfully confirmed that browser blocks submission of '{0}' form to server when clicking declarative action '{1}'"],  step.inputs.table, step.inputs.ui_action.name);
			else if (step.inputs.assert_type === "page_reloaded_or_redirected")
				message = formatMessage(messages["Successfully confirmed that '{0}' form is reloaded or redirected when clicking declarative action '{1}'"], step.inputs.table, step.inputs.ui_action.name);
			else
				message = formatMessage(messages["Successfully clicked declarative action '{0}' on '{1}' form"], step.inputs.ui_action.name, step.inputs.table);
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
		var msg = "";
		if (typeof result === "string") // Legacy UI result
			msg = result;
		else if (result.message) // An error was thrown
			msg = result.message;
		else { // Configurable workspace result
			if (result.reason === "action_not_present")
				msg = formatMessage(messages["FAILURE: Failed to find declarative action '{0}' on '{1}' form"], step.inputs.ui_action.name, step.inputs.table);
			else if (step.inputs.assert_type === "form_submitted_to_server")
				msg = formatMessage(messages["FAILURE: Browser failed to submit '{0}' form to server when clicking declarative action '{1}'"], step.inputs.table, step.inputs.ui_action.name);
			else if (step.inputs.assert_type === "form_submission_canceled_in_browser")
				msg = formatMessage(messages["FAILURE: Browser failed to block submission of '{0}' form to server when clicking declarative action '{1}'"], step.inputs.table, step.inputs.ui_action.name);
			else if (step.inputs.assert_type === "page_reloaded_or_redirected")
				msg = formatMessage(messages["FAILURE: '{0}' form is not reloaded or redirected when clicking declarative action '{1}'"], step.inputs.table, step.inputs.ui_action.name);
			else
				msg = formatMessage(messages["FAILURE: Unknown error clicking declarative action: '{0}'"], step.inputs.ui_action.name);
		}

		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = false;
		stepResult.message = msg;
		step.defer.reject();
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
