(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var ADD_ROW_TO_TABLE_VARIABLE = "Adding row to Table variable.";
	var MESSAGE_KEY_ERROR_NO_GFORM = "ERROR: Cannot find g_form on page.";
	var MESSAGE_KEY_ERROR_NO_TABLE_VAR_GFORM = "ERROR: Cannot find g_form for Table variable.";
	var MESSAGE_KEY_ADD_ROW_SUCCESSFUL = "SUCCESS: Successfully added row to Table variable.";
	var MESSAGE_KEY_ROW_ADD_FAILURE = "FAILURE: Failed to add row to Table variable.";
	var messageMap = new GwtMessage().getMessages(["Adding row to Table variable.", "ERROR: Cannot find g_form on page.", "ERROR: Cannot find g_form for Table variable.", "SUCCESS: Successfully added row to Table variable.", "FAILURE: Failed to add row to Table variable."]);
	
	g_ui_testing_util.setTestStepStatusMessage(messageMap[ADD_ROW_TO_TABLE_VARIABLE]);
	
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
	
	function getUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var interval = setInterval(function() {
			if(typeof testFrameWindow.catalog_util == "undefined") {
				count++;
				if(count >= 5) {
					clearInterval(interval);
					deferred.reject(MESSAGE_KEY_ERROR_NO_GFORM);
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
	
	function getGform(tableUtil) {
		tableUtil.updateGform();
		onSuccess(MESSAGE_KEY_ADD_ROW_SUCCESSFUL);
	}
	
	function addRow(catalogUtil) {
		catalogUtil.addRow(step.inputs.variable_set, step.timeout * 1000).then(function() {
			getTableVariableUtil().then(getGform, onFailure);
		}, onFailure);
	}
	
	getUtil().then(addRow, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
