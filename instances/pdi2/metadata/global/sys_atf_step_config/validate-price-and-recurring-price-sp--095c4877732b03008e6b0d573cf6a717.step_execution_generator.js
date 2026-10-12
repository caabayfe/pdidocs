(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_RUNNING_PRICE_VALIDATION = "Running catalog item price validations";
	var MESSAGE_KEY_VALIDATION_STEP = "Validating {0} of the catalog item";
	var MESSAGE_KEY_FAILURE_EXPECTED = "FAILURE: Expected {0} to be {1} but is {2}";
	var MESSAGE_KEY_SUCCESS_VALIDATED = "SUCCESS: Successfully validated pricing details of the catalog item";
	var MESSAGE_KEY_FAILED_CATALOG_UTIL = "FAILURE: Failed to get catalog_util on current form.";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_RUNNING_PRICE_VALIDATION, MESSAGE_KEY_VALIDATION_STEP, MESSAGE_KEY_FAILURE_EXPECTED, MESSAGE_KEY_SUCCESS_VALIDATED, MESSAGE_KEY_FAILED_CATALOG_UTIL]);

	function onFailure(msg) {
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.message = msg;
		stepResult.success = false;
		step.defer.reject();
	}

	function onSuccess(msg) {
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.message = msg;
		stepResult.success = true;
		step.defer.resolve();
	}

	
	function getCatalogUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
		var interval = setInterval(function() {
			if (testFrameWindow.catalog_util == 'undefined') {
				count++;
				if (count >= 5) {
					clearInterval(interval);
					deferred.reject(messageMap[MESSAGE_KEY_FAILED_CATALOG_UTIL]);
				}

			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.catalog_util);
			}
		}, 100);
		return deferred.promise;	
	}
	
	function assertPrice(catalogUtil) {
		var pricing = catalogUtil.getPrice();
		for (var key in step.inputs) {
			if (key == 'catalog_item')
				continue;
			g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_VALIDATION_STEP], key));
			if (step.inputs[key] && step.inputs[key] !== pricing[key]) {
				var failMsg = formatMessage(messageMap[MESSAGE_KEY_FAILURE_EXPECTED], key, step.inputs[key], pricing[key]);
				onFailure(failMsg);
				return;
			}
		}
		onSuccess(messageMap[MESSAGE_KEY_SUCCESS_VALIDATED]);
	}
	
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_RUNNING_PRICE_VALIDATION]);
	
	getCatalogUtil().then(assertPrice, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
