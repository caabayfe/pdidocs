(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
		// Get the ATFListHelper Object
		var alh = new ATFListHelper(step.inputs);
		var isRelatedList = alh.isRelatedList();

		// Messages for message map
		var OPEN_RECORD_MESSAGE = isRelatedList ?
			"Opening record with id '{0}' in the '{1}' related list on the '{2}' form" :
			"Opening record with id '{0}' in the '{1}' list";
		var OPEN_RECORD_SUCCESS = isRelatedList ?
			"Successfully opened the record with id '{0}' in the '{1}' related list on the '{2}' form" :
			"Successfully opened the record with id '{0}' in the '{1}' list";
		var OPEN_RECORD_FAILURE = isRelatedList ?
			"FAILURE: Failed to open the record with id '{0}' in the '{1}' related list on the '{2}' form" :
			"FAILURE: Failed to open the record with id '{0}' in the '{1}' list";
		var RECORD_NOT_PRESENT_FAILURE = isRelatedList ?
			"FAILURE: Failed to open the record with id '{0}' in the '{1}' related list on the '{2}' form. Record is not present in the related list" :
			"FAILURE: Failed to open the record with id '{0}' in the '{1}' list. Record is not present in the list";

		// Init the message map
		var messageMap = new GwtMessage().getMessages([OPEN_RECORD_MESSAGE, OPEN_RECORD_SUCCESS, OPEN_RECORD_FAILURE, RECORD_NOT_PRESENT_FAILURE]);
		var listLabel = step.inputs.list_label;
		var recordId = step.inputs.record_id;

		function addMessageContext(msg) {
			// Format the step result message with appropriate values depending on the context
			if (isRelatedList)
				return formatMessage(messageMap[msg], recordId, listLabel, step.inputs.table);

			return formatMessage(messageMap[msg], recordId, listLabel);
		}

		// Get the query string to filter to the record on the list
		var filterString = "sys_id=" + recordId + "^EQ";

		// Set the step status
		g_ui_testing_util.setTestStepStatusMessage(addMessageContext(OPEN_RECORD_MESSAGE));

		// Applies the filter to the given list to filter out the record to be opened then opens the record
		alh.getListObject()
			.then(function(gList) { return alh.applyFilter(gList, filterString); })
			.then(_openRecord)
			['catch'](function(ex) {
				failStep(alh.getExceptionMessage(ex));
			});

		function _openRecord(gList) {
			var tableName = gList.getTableName();
			var viewName = "";
			// Get the view from the form, this view will be applied to the record being opened
			if (isRelatedList)
				viewName = g_ui_testing_util.getTestIFrameGForm().getViewName();
			else {
				var gURL = new GlideURL(g_ui_testing_util.getTestIFrameWindow().location.href);
				viewName = decodeURIComponent(gURL.params['sysparm_view']);
			}

			// Open the record if it is present else fail the step
			if (gList.totalRows === 1)
				g_ui_testing_util.openFormAndAssert(tableName, recordId, viewName)
					.then(passStep, failStep);
			else
				failStep(addMessageContext(RECORD_NOT_PRESENT_FAILURE));
		}

		// Function to set the step result to success and also resolve the promise.
		function passStep() {
			stepResult.success = true;
			stepResult.message = addMessageContext(OPEN_RECORD_SUCCESS);
			g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
			step.defer.resolve();
		}

		// Function to set the step result and messages to failure and also reject the promise.
		function failStep(msg) {
			if (!msg)
				msg = addMessageContext(OPEN_RECORD_FAILURE);

			stepResult.success = false;
			stepResult.message = msg;
			g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
			step.defer.reject();
		}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
