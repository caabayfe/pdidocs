(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_VALIDATE_ITEMS = "Validating items included in Order guide.";
	var MESSAGE_KEY_SUCCESSFUL_VALIDATE = "SUCCESS: Successfully validated all items and price of Order Guide.";
	var MESSAGE_KEY_FAILED_TO_VALIDATE = "FAILURE: Failed to validate some items in Order Guide.";
	var MESSAGE_KEY_FAILED_GUIDE_UTIL = "FAILURE: Unable to validate, g_form is not defined.";
	var MESSAGE_KEY_FAILED_PRICE_VALIDATE = "FAILURE: Failed to validate price of Order Guide.";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_VALIDATE_ITEMS, MESSAGE_KEY_SUCCESSFUL_VALIDATE, MESSAGE_KEY_FAILED_TO_VALIDATE, MESSAGE_KEY_FAILED_GUIDE_UTIL, MESSAGE_KEY_FAILED_PRICE_VALIDATE]);
	
	function onSuccess(msg) {
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = true;
		stepResult.message = msg;
		step.defer.resolve();
	}
	
	function onFailure(msg) {
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.success = false;
		stepResult.message = msg;
		step.defer.reject();
	}
	
	function getGuideUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
		var interval = setInterval(function() {
			if (testFrameWindow.catalog_util == undefined) {
				count++;
				if (count >= 5) {
					clearInterval(interval);
					deferred.reject(messageMap[MESSAGE_KEY_FAILED_GUIDE_UTIL]);
				}

			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.catalog_util);
			}
		}, 100);
		return deferred.promise;	
	}
	
	function validateItems(guideUtil) {
		var guideStage = 2;
		if (guideUtil.validateIncludedList(step.inputs.catalog_items + '', guideStage)) {
			if (step.inputs.price === '')
				onSuccess(messageMap[MESSAGE_KEY_SUCCESSFUL_VALIDATE]);
			else if (guideUtil.getGuidePrice() === step.inputs.price)
				onSuccess(messageMap[MESSAGE_KEY_SUCCESSFUL_VALIDATE]);
			else
				onFailure(messageMap[MESSAGE_KEY_FAILED_PRICE_VALIDATE]);
		}
		else
			onFailure(messageMap[MESSAGE_KEY_FAILED_TO_VALIDATE]);
	}
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_VALIDATE_ITEMS]);
	getGuideUtil().then(validateItems, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
