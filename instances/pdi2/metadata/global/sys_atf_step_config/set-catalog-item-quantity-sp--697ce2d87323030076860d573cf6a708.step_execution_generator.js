(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_SET_QUANTITY = "Setting quantity to {0}";
	var MESSAGE_KEY_ERROR_NO_GFORM = "ERROR: Cannot find g_form on page";
	var MESSAGE_KEY_QUANTITY_SET_SUCCESSFUL = "Successfully set quantity of the item to {0}";
	var MESSAGE_KEY_QUANTITY_ERROR = "FAILURE: Expected quantity value to be {0} but found {1}";
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_SET_QUANTITY, MESSAGE_KEY_ERROR_NO_GFORM, MESSAGE_KEY_QUANTITY_SET_SUCCESSFUL, MESSAGE_KEY_QUANTITY_ERROR]);
	
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_SET_QUANTITY], step.inputs.quantity));
	
	function onSuccess(message) {
		g_ui_testing_util.setTestStepStatusMessage(message);
		stepResult.success = true;
		stepResult.message = message;
		step.defer.resolve();
	}
	
	function onFailure(message) {
		g_ui_testing_util.setTestStepStatusMessage(message);
		stepResult.success = false;
		stepResult.message = message;
		step.defer.reject();
	}

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
	
	function getUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var interval = setInterval(function() {
			if(typeof testFrameWindow.catalog_util == undefined) {
				count++;
				if(count >= 5) {
					clearInterval(interval);
					return deferred.reject(MESSAGE_KEY_ERROR_NO_GFORM);
				}
			} else {
				clearInterval(interval);
				return deferred.resolve(testFrameWindow.catalog_util);
			}
		}, 100);
		return deferred.promise;
	}
	
	function setAndAssertQuantity(catalogUtil) {
		catalogUtil.setQuantity(parseInt(step.inputs.quantity));
		var actualQuantity = catalogUtil.getQuantity();
		if (actualQuantity == step.inputs.quantity)
			onSuccess(formatMessage(MESSAGE_KEY_QUANTITY_SET_SUCCESSFUL, step.inputs.quantity));
		else
			onFailure(formatMessage(MESSAGE_KEY_QUANTITY_ERROR, [step.inputs.quantity, actualQuantity]));
	}
	
	getUtil().then(setAndAssertQuantity, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
