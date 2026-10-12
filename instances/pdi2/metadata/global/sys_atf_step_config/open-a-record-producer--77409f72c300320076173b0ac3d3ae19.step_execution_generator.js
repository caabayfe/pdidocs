
    (function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_OPENING = "Opening Record Producer";
	var MESSAGE_KEY_SUCCESSFULY_OPENED = "Successfully opened";
	var MESSAGE_KEY_FAILED_TO_OPEN = "FAILURE: Failed to open";
	var MESSAGE_KEY_MESSAGE_WITH_PREFIX_EXISTING_FORM = "{0} the '{1}'";
	var MESSAGE_KEY_NULL_ID = "FAILURE: Failed to open the '{0}' with the id 'null'";
	var MESSAGE_KEY_INCORRECT_ID = "A sys_id was expected, however none was present. Please ensure that you are passing in the sys_id of the record producer correctly";
	//init message map
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_OPENING, MESSAGE_KEY_SUCCESSFULY_OPENED, MESSAGE_KEY_FAILED_TO_OPEN, MESSAGE_KEY_MESSAGE_WITH_PREFIX_EXISTING_FORM, MESSAGE_KEY_NULL_ID, MESSAGE_KEY_INCORRECT_ID]);
	
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_OPENING]);

	function onSuccess() {
		var message = getStepMessageWithPrefix(messageMap[MESSAGE_KEY_SUCCESSFULY_OPENED]);
		g_ui_testing_util.setTestStepStatusMessage(message);
		stepResult.success = true;
		stepResult.message = message;
		step.defer.resolve();
	}

	function onFailure(reason) {
		var message = getStepMessageWithPrefix(messageMap[MESSAGE_KEY_FAILED_TO_OPEN]);
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = false;
		stepResult.message = message + "\n" + reason;
		step.defer.reject();
	}

	function getStepMessageWithPrefix(prefix) {
		return formatMessage(messageMap[MESSAGE_KEY_MESSAGE_WITH_PREFIX_EXISTING_FORM], [prefix, "record producer"]);
	}

	function openForm() {

        g_ui_testing_util.openCatalogItem(step.inputs.catalog_item)
			.then(onSuccess, onFailure);
    }

    if (!step.inputs.catalog_item){
        message = formatMessage(messageMap[MESSAGE_KEY_NULL_ID], "record producer");
        var reason = formatMessage(messageMap[MESSAGE_KEY_INCORRECT_ID]);
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = false;
		stepResult.message = message + "\n" + reason;
		step.defer.reject();
	} else {
		openForm();
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
