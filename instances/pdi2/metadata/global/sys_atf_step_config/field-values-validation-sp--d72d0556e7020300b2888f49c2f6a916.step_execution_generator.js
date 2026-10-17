(function executeStep(step, stepResult) {
	var MESSAGE_KEY_RUNNING_VALIDATION = "Running field value validation";
	var MESSAGE_KEY_FAILED_NO_G_FORM = "FAILURE: Unable to run field values validation, g_form is not defined. A valid form must be open before validating values";
	var MESSAGE_KEY_SERVER_MISSING_VALS = "The server response was missing one or more values";
	
	var messages = new GwtMessage().getMessages([MESSAGE_KEY_RUNNING_VALIDATION, MESSAGE_KEY_FAILED_NO_G_FORM, MESSAGE_KEY_SERVER_MISSING_VALS]);
	
	g_ui_testing_util.setTestStepStatusMessage(messages[MESSAGE_KEY_RUNNING_VALIDATION]);
	
	function failStep(message) {
		stepResult.success = false;
		stepResult.status = "error";
		stepResult.message = messages[message];

		g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
		step.defer.reject();
	}
	
	var g_form = g_ui_testing_util.getTestIFrameWindow().g_form;

	if (!g_form) {
		return failStep(MESSAGE_KEY_FAILED_NO_G_FORM);
	}
	
	function handleConditionEvalAjaxResponse(response) {
		try {
			var evaluationResult = response.responseXML.getElementsByTagName("evaluation_result")[0];
			var evalStatus = evaluationResult.getAttribute("status");
			var evalMessage = evaluationResult.getAttribute("message");

			stepResult.success = ("success" === evalStatus);
			stepResult.status = evalStatus;
			stepResult.message = evalMessage;
			
			g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
			step.defer.resolve();
		} catch(e) {
			failStep(MESSAGE_KEY_SERVER_MISSING_VALS);
		}
	}
	
	var serializedGForm = g_form.serializeToString();
	
	// remove rollbackContextId from the g_form
	var rollbackContextParam = "&sysparm_rollback_context_id=" + g_ui_testing_util.getRollbackContextId();
	serializedGForm = serializedGForm.replace(rollbackContextParam, "");

	var conditionEvalAjax = new GlideAjax("com.glide.automated_testing_framework.processors.SPATFConditionEvaluator");
	conditionEvalAjax.addEncodedString(serializedGForm);
	conditionEvalAjax.addParam("sysparm_step_id", step.sys_id);
	conditionEvalAjax.addParam("sysparm_test_result_id", step.test_result_id);
	conditionEvalAjax.getXML(handleConditionEvalAjaxResponse);
}(step, stepResult));
