(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var SAVE_ROW_TO_TABLE_VARIABLE = "Save current row to Table variable.";
	var MESSAGE_KEY_ERROR_NO_TABLE_VAR_GFORM = "ERROR: Cannot find g_form for Table variable.";
	var MESSAGE_KEY_SAVE_ROW_SUCCESSFUL = "SUCCESS: Successfully saved current row of Table variable.";
	var MESSAGE_KEY_SAVE_ROW_FAILURE = "FAILURE: Failed to save current row of Table variable.";
	var FAILED_TO_BLOCK_SUBMIT = "FAILURE: Failed to block saving current row of Table variable.";
	var MESSAGE_KEY_SUCCESS_BLOCK = "SUCCESS: Successfully stopped saving current row of Table variable.";
	var MESSAGE_KEY_ERROR_NO_CATALOG_GFORM = "FAILURE: Failed to load catalog item g_form back.";
	
	var messageMap = new GwtMessage().getMessages(["Save current row to Table variable.", "ERROR: Cannot find g_form for Table variable.", "SUCCESS: Successfully saved current row of Table variable.", "FAILURE: Failed to save current row of Table variable.", "FAILURE: Failed to block saving current row of Table variable.", "SUCCESS: Successfully stopped saving current row of Table variable.", "FAILURE: Failed to load catalog item g_form back."]);
	
	g_ui_testing_util.setTestStepStatusMessage(messageMap[SAVE_ROW_TO_TABLE_VARIABLE]);
	
	function onSuccess(msg) {
		msg = messageMap[msg];
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = true;
		stepResult.message = msg;
		step.defer.resolve();
	}
	
	function onFailure(msg) {
		msg = messageMap[msg];
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = false;
		stepResult.message = msg;
		step.defer.reject();
	}

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
	
	function getCatalogUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var interval = setInterval(function() {
			if(typeof testFrameWindow.catalog_util == "undefined") {
				count++;
				if(count >= 5) {
					clearInterval(interval);
					deferred.reject(MESSAGE_KEY_ERROR_NO_CATALOG_GFORM);
				}
			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.catalog_util);
			}
		}, 100);
		return deferred.promise;
	}
	
	function getTableVariableUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var interval = setInterval(function() {
			if(typeof testFrameWindow.table_var_util == "undefined") {
				count++;
				if(count >= 10) {
					clearInterval(interval);
					deferred.reject(MESSAGE_KEY_ERROR_NO_TABLE_VAR_GFORM);
				}
			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.table_var_util);
			}
		}, 100);
		return deferred.promise;
	}
	
	function updateGform(catalogUtil) {
		catalogUtil.updateGform();
		onSuccess(MESSAGE_KEY_SAVE_ROW_SUCCESSFUL);
	}
	
	function saveRow(tableUtil) {
		var assertType = step.inputs.assert_type;
		tableUtil.saveRow(step.timeout * 1000).then(function() {
			if (assertType == "form_submitted_to_server")
				getCatalogUtil().then(updateGform, onFailure);
			else
				onFailure(FAILED_TO_BLOCK_SUBMIT);
		}, function() {
			if (assertType == "form_submission_cancelled_in_browser")
				onSuccess(MESSAGE_KEY_SUCCESS_BLOCK);
			else
				onFailure(MESSAGE_KEY_SAVE_ROW_FAILURE);
		});
	}
	
	getTableVariableUtil().then(saveRow, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
