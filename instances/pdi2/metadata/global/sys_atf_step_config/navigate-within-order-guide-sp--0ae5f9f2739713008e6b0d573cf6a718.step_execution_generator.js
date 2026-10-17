(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_NAVIGATION = "Navigating Order guide to given step.";
	var MESSAGE_KEY_SUCCESSFUL_NAVIGATE = "SUCCESS: Navigation of Order Guide is successful.";
	var MESSAGE_KEY_FAILED_TO_NAVIGATE = "FAILURE: Failed to navigate Order Guide.";
	var MESSAGE_KEY_FAILED_GUIDE_UTIL = "FAILURE: Unable to navigate Order Guide, g_form is not defined.";
	var FAILED_STOP_NAVIGATION = "FAILURE: Navigation was not blocked by browser.";
	var SUCCESS_STOP_NAVIGATION = "SUCCESS: Navigation is successfully blocked by browser submit.";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_NAVIGATION, MESSAGE_KEY_SUCCESSFUL_NAVIGATE, MESSAGE_KEY_FAILED_TO_NAVIGATE, MESSAGE_KEY_FAILED_GUIDE_UTIL, FAILED_STOP_NAVIGATION, SUCCESS_STOP_NAVIGATION]);
	
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
					deferred.reject(messageMap[MESSAGE_KEY_FAILED_GUIDE_UTIL]);
				}

			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.catalog_util);
			}
		}, 100);
		return deferred.promise;	
	}
	
	function goNext(guideUtil) {
		guideUtil.navigateToStep(step.inputs.guide_step + '', step.timeout * 1000).then(function (result) { //success case
			step.inputs.assert_type == 'navigate_success' ? onSuccess(messageMap[MESSAGE_KEY_SUCCESSFUL_NAVIGATE]) : onFailure(messageMap[FAILED_STOP_NAVIGATION]);
		}, function() {//Error case
			step.inputs.assert_type == 'navigate_success' ? onFailure(messageMap[MESSAGE_KEY_FAILED_TO_NAVIGATE]) : onSuccess(messageMap[SUCCESS_STOP_NAVIGATION]);
		});
		
	}
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_NAVIGATION]);
	getCatalogUtil().then(goNext, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
