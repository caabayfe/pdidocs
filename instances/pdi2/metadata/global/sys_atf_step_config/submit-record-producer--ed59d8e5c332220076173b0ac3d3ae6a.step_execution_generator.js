
	(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_SUBMIT_PRODUCER = "Performing 'Submit producer' action";
	var MESSAGE_KEY_CANNOT_SUBMIT = "FAILURE: Record producer is not open. See screenshot";
	var MESSAGE_KEY_PASS_CANNOT_SUBMIT = "SUCCESS: Cannot submit producer";
	var MESSAGE_KEY_FAIL_CAN_SUBMIT = "FAILURE: Can successfully submit producer";
	var MESSAGE_KEY_FAIL_CANNOT_SUBMIT = "FAILURE: Cannot submit producer";
	var MESSAGE_KEY_CHECKING_SUBMIT_STATE = "Checking if record producer submit was successful";
	var MESSAGE_KEY_SUCCESSFUL_SUBMIT = "SUCCESS: Record producer submitted successfully";
	var MESSAGE_KEY_FAILED_SUBMIT_USING_ACTION = "FAILURE: Target record was not generated. Record producer submission was unsuccessful";
	var MESSAGE_KEY_FORM_NOT_FOUND = "FAILURE: Glide Form was not present";
	var MESSAGE_KEY_FAIL_ACTION_ELEMENT = "FAILURE: Cannot find 'Submit' button";
	var MESSAGE_KEY_UNKNOWN_ASSERT_TYPE = "FAILURE: Assert type cannot be empty";
	
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_SUBMIT_PRODUCER, MESSAGE_KEY_CANNOT_SUBMIT, MESSAGE_KEY_PASS_CANNOT_SUBMIT, MESSAGE_KEY_CHECKING_SUBMIT_STATE, MESSAGE_KEY_SUCCESSFUL_SUBMIT, MESSAGE_KEY_FAILED_SUBMIT_USING_ACTION, MESSAGE_KEY_FORM_NOT_FOUND, MESSAGE_KEY_FAIL_ACTION_ELEMENT, MESSAGE_KEY_FAIL_CANNOT_SUBMIT, MESSAGE_KEY_UNKNOWN_ASSERT_TYPE, MESSAGE_KEY_FAIL_CAN_SUBMIT]);
	
	var buttonId = "submit_button";

	// set initial status message
    g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_SUBMIT_PRODUCER]);

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
	if (typeof(testFrameWindow.gel) == 'undefined') {
        message = messageMap[MESSAGE_KEY_CANNOT_SUBMIT];
        g_ui_testing_util.setTestStepStatusMessage(message);
        stepResult.success = false;
        stepResult.message = message;
        step.defer.reject();
        return;
    }
	
	function checkSuccessfulSubmit() {
		g_ui_testing_util.clearTestIFrameOnloadFunction();
		//page reloaded, go to server to see if form actually got submitted
		g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_CHECKING_SUBMIT_STATE]);
		var ga = new GlideAjax("CatalogATFAjax");
		ga.addParam("sysparm_name", "checkTargetRecordGeneration");
		ga.addParam("item_guid", targetRecordId);
		ga.addParam("item_id", catalog_item_id);
		ga.getXMLWait();
		var successfulSubmit = ga.getAnswer() + '';
		if (successfulSubmit == "true") {
			message = messageMap[MESSAGE_KEY_SUCCESSFUL_SUBMIT];
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
		} else {
			message = messageMap[MESSAGE_KEY_FAILED_SUBMIT_USING_ACTION];
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		}
	}

	//Step is expected to load to target record
	if (step.inputs.assert_type == "form_submitted_to_server")
		g_ui_testing_util.setTestIFrameOnloadFunction(checkSuccessfulSubmit);

	var g_form = g_ui_testing_util.getTestIFrameGForm();
	if (!g_form) {
		message = messageMap[MESSAGE_KEY_FORM_NOT_FOUND];
		stepResult.success = false;
		stepResult.message = message;
		step.defer.reject();
		return;
	}
	var targetRecordId = testFrameWindow.g_form.getParameter("sysparm_item_guid");
	var catalog_item_id = testFrameWindow.g_form.getParameter("sysparm_id");

	if (!testFrameWindow.g_form.catalogOnSubmit()) {
		g_ui_testing_util.clearTestIFrameOnloadFunction();
		if (step.inputs.assert_type === 'form_submission_cancelled_in_browser') {
			// we expected the form submission to fail and it did. So step PASSED
			message = messageMap[MESSAGE_KEY_PASS_CANNOT_SUBMIT];
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
			return;
		} else if (step.inputs.assert_type === 'form_submitted_to_server') {
			// we expected the form to submit successfully but it did not. Step FAILED
			message = messageMap[MESSAGE_KEY_FAIL_CANNOT_SUBMIT];
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
			return;
		} else {
			//Assert type none means successful form submission
			message = messageMap[MESSAGE_KEY_UNKNOWN_ASSERT_TYPE];
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
			return;
		}
	} else {
		if (step.inputs.assert_type === 'form_submission_cancelled_in_browser') {
			message = messageMap[MESSAGE_KEY_FAIL_CAN_SUBMIT];
			stepResult.message = message;
			stepResult.success = false;
			step.defer.reject();
			return;
		}
		var actionElement = testFrameWindow.gel(buttonId);
		if (actionElement && actionElement.onclick) {
			stepResult.outputs.record_id = targetRecordId;
			actionElement.onclick();
		} else {
			message = messageMap[MESSAGE_KEY_FAIL_ACTION_ELEMENT];
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		}
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
