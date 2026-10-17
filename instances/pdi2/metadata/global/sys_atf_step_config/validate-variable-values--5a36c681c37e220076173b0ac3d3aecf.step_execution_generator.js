(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_RUNNING_VALIDATION = "Running variable value validation";
	var MESSAGE_KEY_SERVER_MISSING_VALS = "The server response was missing one or more values.";
	var messages = new GwtMessage().getMessages([MESSAGE_KEY_RUNNING_VALIDATION, MESSAGE_KEY_SERVER_MISSING_VALS]);
	g_ui_testing_util.setTestStepStatusMessage(messages[MESSAGE_KEY_RUNNING_VALIDATION]);
	

	var retryCount = step.timeout;
	if (isNaN(retryCount))
		retryCount = 0;

	var utilInterval = null;
	var assertInterval = null;

	if (retryCount > 0) {
		utilInterval = g_ui_testing_util._getAngularInjector("$interval");
		assertInterval = utilInterval(assertForm, 1000);
	}
	else {
		assertForm(0);
	}

	function assertForm(iterationCount) {
		var conditionEvalAjax = new GlideAjax("com.glide.automated_testing_framework.processors.SCATFConditionEvaluator");
		if(isVEFlow() && g_ui_testing_util.getTestIFrameWindow().g_sc_form)
			conditionEvalAjax.addEncodedString(g_ui_testing_util.getTestIFrameWindow().g_sc_form.serialize());
		else
			conditionEvalAjax.addEncodedString(g_ui_testing_util.getTestIFrameGForm().serialize());
		conditionEvalAjax.addParam("sysparm_step_id", step.sys_id);
		conditionEvalAjax.addParam("sysparm_test_result_id", step.test_result_id);
		conditionEvalAjax.getXML(handleConditionEvalAjaxResponse);

		function handleConditionEvalAjaxResponse(response){
			try{
				var evaluationResult = response.responseXML.getElementsByTagName("evaluation_result")[0];
				var evalStatus = evaluationResult.getAttribute("status");
				var evalMessage = evaluationResult.getAttribute("message");

				stepResult.success = ("success" === evalStatus);
				stepResult.status = evalStatus;
				stepResult.message = evalMessage;
			}catch(e){
				stepResult.success = false;
				stepResult.status = "error";
				stepResult.message = messages[MESSAGE_KEY_SERVER_MISSING_VALS];
			}

			if(stepResult.success) {
				if (utilInterval != null)
					utilInterval.cancel(assertInterval);
				g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
				step.defer.resolve();
			}
			else {
				if (iterationCount >= retryCount || utilInterval == null) {
					if (utilInterval != null)
						utilInterval.cancel(assertInterval);
					g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
					step.defer.reject();
				}
			}
		}
	}

	function isVEFlow() {
		var theGForm = g_ui_testing_util.getTestIFrameGForm();
		if(!theGForm)
			return false;

		var table = theGForm.getTableName();
		if (table != 'ni')
			return true;
		else
			return false;
		}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
