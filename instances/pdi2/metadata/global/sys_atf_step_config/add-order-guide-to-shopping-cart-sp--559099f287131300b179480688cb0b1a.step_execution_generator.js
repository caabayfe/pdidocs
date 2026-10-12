(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_ADD_TO_CART_STEP = "Performing 'Add to cart' action";
	var FAILED_NO_G_FORM = "FAILURE: Unable to submit form, g_form is not defined. A valid form must be open before submission";
	var FAILED_BROWSER_BLOCK_SUBMIT = "FAILURE: Browser failed to block submission of form to server";
	var SUCCESS_CONFIRM_BROWSER_BLOCK = "Successfully confirmed that browser blocks submission of form to server";
	var FAILED_SUBMIT = "FAILURE: Failed to Add the order guide to cart.";
	var SUCCESS_SUBMIT = "SUCCESS: Order guide was successfully added to cart.";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_ADD_TO_CART_STEP, FAILED_NO_G_FORM, FAILED_BROWSER_BLOCK_SUBMIT, SUCCESS_CONFIRM_BROWSER_BLOCK, FAILED_SUBMIT, SUCCESS_SUBMIT]);

	// set initial status message
    g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_ADD_TO_CART_STEP]);

	function onFailure(msg) {
		msg = messageMap[msg];
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.message = msg;
		stepResult.success = false;
		step.defer.reject();
	}

	function onSuccess(msg) {
		msg = messageMap[msg];
		g_ui_testing_util.setTestStepStatusMessage(msg);
		stepResult.message = msg;
		stepResult.success = true;
		step.defer.resolve();
	}

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
	
	function getOrderGuideUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var interval = setInterval(function() {
			if (testFrameWindow.catalog_util == 'undefined') {
				count++;
				if (count >= 5) {
					clearInterval(interval);
					deferred.reject(FAILED_NO_G_FORM);
				}

			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.catalog_util);
			}
		}, 100);
		return deferred.promise;	
	}
	
	function assertAddToCart(orderGuideUtil) {
		var assertType = step.inputs.assert_type;
		
		orderGuideUtil.addToCart().then(function(response) {
			if (assertType == "form_submitted_to_server") {
				onSuccess(SUCCESS_SUBMIT);
			}
			else
				onFailure(FAILED_BROWSER_BLOCK_SUBMIT);
		}, function() {
			if (assertType == "form_submission_cancelled_in_browser")
				onSuccess(SUCCESS_CONFIRM_BROWSER_BLOCK);
			else
				onFailure(FAILED_SUBMIT);
		});
	}
	getOrderGuideUtil().then(assertAddToCart, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
