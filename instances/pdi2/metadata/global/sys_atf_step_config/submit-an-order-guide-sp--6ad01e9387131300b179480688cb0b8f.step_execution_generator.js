(function executeStep(step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_ORDER_NOW_STEP = "Performing 'Order Now' action";
	var FAILED_NO_G_FORM = "FAILURE: Unable to submit form, g_form is not defined. A valid form must be open before setting values";
	var FAILED_BROWSER_BLOCK_SUBMIT = "FAILURE: Browser failed to block submission of form to server";
	var SUCCESS_CONFIRM_BROWSER_BLOCK = "Successfully confirmed that browser blocks submission of form to server";
	var FAILED_SUBMIT = "FAILURE: Failed to Submit the order guide.";
	var SUCCESS_SUBMIT = "SUCCESS: Order guide was successfully submitted.";
	var FAILED_CHECKOUT_MODAL = "FAILURE: Failed to load checkout modal on the form.";
	var FAILED_VALIDATION = "FAILURE: Validations failed. Failed to order the order guide.";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_ORDER_NOW_STEP, FAILED_NO_G_FORM, FAILED_BROWSER_BLOCK_SUBMIT, SUCCESS_CONFIRM_BROWSER_BLOCK, FAILED_SUBMIT, SUCCESS_SUBMIT, FAILED_CHECKOUT_MODAL, FAILED_VALIDATION]);

	// set initial status message
    g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_ORDER_NOW_STEP]);

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
			if (typeof testFrameWindow.catalog_util == 'undefined') {
				count++;
				if (count >= 5) {
					clearInterval(interval);
					deferred.reject(FAILED_NO_G_FORM);
				}

			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.catalog_util);
			}
		}, 1000);
		return deferred.promise;	
	}
	
	function getCheckoutUtil() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var interval = setInterval(function() {
			if (typeof testFrameWindow.checkout_util == 'undefined') {
				count++;
				if (count >= 5) {
					clearInterval(interval);
					deferred.reject(FAILED_CHECKOUT_MODAL);
				}

			} else {
				clearInterval(interval);
				deferred.resolve(testFrameWindow.checkout_util);	
			}
		}, 1000);
		return deferred.promise;	
	}
	
	function assertCheckoutModal(checkoutUtil) {
		var assertType = step.inputs.assert_type;
		checkoutUtil.checkout().then(function(result) {
			if (typeof result.number == "undefined") {
				stepResult.outputs.table = undefined;
				stepResult.outputs.record_id = undefined;
				onFailure(FAILED_SUBMIT);
			}
			else {
				stepResult.outputs.table = result.table;
				stepResult.outputs.record_id = result.sys_id;
				onSuccess(SUCCESS_SUBMIT);
			}
		}, onFailure);
	}
	
	function assertOrderGuide(orderGuideUtil) {
		var assertType = step.inputs.assert_type;
		
		orderGuideUtil.submitOrderGuide().then(function(result) {
			if(assertType == "form_submitted_to_server") {
				if (result && result.single_step) {
					if (typeof result.number == "undefined" && typeof result.request_number == "undefined") {
						stepResult.outputs.table = undefined;
						stepResult.outputs.record_id = undefined;
						onFailure(FAILED_SUBMIT);
					}
					else if (result.request_number) {
						stepResult.outputs.table = "sc_request";
						stepResult.outputs.record_id = result.request_id;
						onSuccess(SUCCESS_SUBMIT);
					}
					else {
						stepResult.outputs.table = result.table;
						stepResult.outputs.record_id = result.sys_id;
						onSuccess(SUCCESS_SUBMIT);
					}
				}
				else
					getCheckoutUtil().then(assertCheckoutModal, onFailure);
			}
			else
				onFailure(FAILED_BROWSER_BLOCK_SUBMIT);
		}, function() {
			if(assertType == "form_submission_cancelled_in_browser")
				onSuccess(SUCCESS_CONFIRM_BROWSER_BLOCK);
			else
				onFailure(FAILED_VALIDATION);
		});
	}
	getOrderGuideUtil().then(assertOrderGuide, onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
