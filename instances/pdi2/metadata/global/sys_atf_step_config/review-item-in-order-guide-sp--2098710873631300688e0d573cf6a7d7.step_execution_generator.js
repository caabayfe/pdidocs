(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_OPEN_ITEM = "Expanding the catalog item.";
	var MESSAGE_KEY_SUCCESSFUL_EXPANDED = "SUCCESS: Item is expanded and " + (step.inputs.included == 'true' ? 'included.' : 'excluded.');
	var MESSAGE_KEY_FAILED_TO_EXPAND = "FAILURE: Item is not present in the Order Guide.";
	var MESSAGE_KEY_FAILED_GUIDE_UTIL = "FAILURE: Unable to validate, g_form is not defined.";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_OPEN_ITEM, MESSAGE_KEY_SUCCESSFUL_EXPANDED, MESSAGE_KEY_FAILED_TO_EXPAND, MESSAGE_KEY_FAILED_GUIDE_UTIL]);
	
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
	
	function openItem(guideUtil) {
		guideUtil.openItem(step.inputs.catalog_item + '', step.inputs.included, step.timeout * 1000).then(
			function() {
				onSuccess(messageMap[MESSAGE_KEY_SUCCESSFUL_EXPANDED]);
			},
			function() {
				onFailure(messageMap[MESSAGE_KEY_FAILED_TO_EXPAND]);
		});		
	}
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_OPEN_ITEM]);
	getGuideUtil().then(openItem, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
