(function executeStep(step, stepResult) {

	// Get the ATFListHelper Object
	var alh = new ATFListHelper(step.inputs);
	var isRelatedList = alh.isRelatedList();

	// messages for message map
	var VALIDATE_RECORD_PRESENT_MESSAGE = isRelatedList ?
		"Validating that the record with id '{0}' is present in the '{1}' related list on the '{2}' form":
		"Validating that the record with id '{0}' is present in the '{1}' list";
	var VALIDATE_RECORD_NOT_PRESENT_MESSAGE = isRelatedList ?
		"Validating that the record with id '{0}' is not present in the '{1}' related list on the '{2}' form":
		"Validating that the record with id '{0}' is not present in the '{1}' list";
	var VALIDATE_RECORD_PRESENT_SUCCESS = isRelatedList ?
		"Successfully validated that the record with id '{0}' was present in the '{1}' related list on the '{2}' form":
		"Successfully validated that the record with id '{0}' was present in the '{1}' list";
	var VALIDATE_RECORD_PRESENT_FAILURE = isRelatedList ?
		"FAILURE: The record with id '{0}' was not present in the '{1}' related list on the '{2}' form":
		"FAILURE: The record with id '{0}' was not present in the '{1}' list";
	var VALIDATE_RECORD_NOT_PRESENT_SUCCESS = isRelatedList ?
		"Successfully validated that the record with id '{0}' was not present in the '{1}' related list on the '{2}' form":
		"Successfully validated that the record with id '{0}' was not present in the '{1}' list";
	var VALIDATE_RECORD_NOT_PRESENT_FAILURE = isRelatedList ?
		"FAILURE: The record with id '{0}' was present in the '{1}' related list on the '{2}' form":
		"FAILURE: The record with id '{0}' was present in the '{1}' list";

	function addMessageContext(msg) {
		// Format the step result message with appropriate values depending on the context
		if (isRelatedList)
			return formatMessage(messageMap[msg], step.inputs.record_id, step.inputs.list_label, step.inputs.table);

		return formatMessage(messageMap[msg], step.inputs.record_id, step.inputs.list_label);
	}

	// init message map
	var messageMap = new GwtMessage().getMessages([VALIDATE_RECORD_PRESENT_MESSAGE, VALIDATE_RECORD_PRESENT_SUCCESS, VALIDATE_RECORD_PRESENT_FAILURE, VALIDATE_RECORD_NOT_PRESENT_SUCCESS, VALIDATE_RECORD_NOT_PRESENT_MESSAGE, VALIDATE_RECORD_NOT_PRESENT_FAILURE]);

	var assertType = step.inputs.assert_type;
	// Set to preserve existing functionality of tests created before assert types were added
	if (!assertType)
		assertType = 'record_present';
	var listLabel = step.inputs.list_label;
	// Query string to filter to the record we are searching for
	var filterString = "sys_id=" + step.inputs.record_id + "^EQ";

	if (assertType == 'record_present')
		g_ui_testing_util.setTestStepStatusMessage(addMessageContext(VALIDATE_RECORD_PRESENT_MESSAGE));
	else
		g_ui_testing_util.setTestStepStatusMessage(addMessageContext(VALIDATE_RECORD_NOT_PRESENT_MESSAGE));

	// Get the timeout and if not given, set a default timeout of 0 sec
	var retryCount = step.timeout;
	if (isNaN(retryCount))
		retryCount = 0;

	var utilInterval = null;
	var assertInterval = null;
	var count;

	// Set the timeout. If the timeout is greater than 0 get the interval function from GUITestingUtil (basically
	// like a setInterval()) to call the function every 1 sec until timeout reached otherwise, call the function only once
	if (retryCount > 0) {
		utilInterval = g_ui_testing_util.interval();
		assertInterval = utilInterval(validateRecord, 1000);
	} else
		validateRecord(0);

	/**
	* Applies a filter to the given list to filter out the record being searched and then
	* validates the assert condition. This function runs in iterations depending on the timeout.
	**/
	function validateRecord(iterationCount) {
		count = iterationCount;
		// Get the related list object and apply the filter
		alh.getListObject()
			.then(function(gList) { return alh.applyFilter(gList, filterString); })
			.then(_assertRecord)
			['catch'](function(ex) {
				if (count < retryCount && utilInterval != null)
					return;

				cancelInterval();
				stepResult.success = false;
				stepResult.message = alh.getExceptionMessage(ex);
				g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
				step.defer.reject();
		});
	}

	// Pass/fails the step based on the assertion and the result of the applied filter
	function _assertRecord(gList) {
		var totalRows = gList.totalRows;
		stepResult.success = false;

		if (assertType == 'record_present' && totalRows > 0)
			passStep(VALIDATE_RECORD_PRESENT_SUCCESS);
		else if (assertType == 'no_record_present' && totalRows === 0)
			passStep(VALIDATE_RECORD_NOT_PRESENT_SUCCESS);

		// If the step fails and utilInterval is set, keep checking until the timeout reaches. If utilInterval is not set, proceed without waiting.
		if (!stepResult.success) {
			if (count < retryCount && utilInterval != null)
					return;

			if (assertType == 'record_present')
				failStep(VALIDATE_RECORD_PRESENT_FAILURE);
			else
				failStep(VALIDATE_RECORD_NOT_PRESENT_FAILURE);
		}
	}

	// Functions to pass/fail the step and cancel the interval
	function passStep(msg) {
		cancelInterval();
		stepResult.success = true;
		stepResult.message = addMessageContext(msg);
		g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
		step.defer.resolve();
	}

	function failStep(msg) {
		cancelInterval();
		stepResult.message = addMessageContext(msg);
		g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
		step.defer.reject();
	}

	// This function is used to cancel the setInterval() set for validateRecord()
	function cancelInterval() {
		if (utilInterval != null)
			utilInterval.cancel(assertInterval);
	}
}(step, stepResult));
