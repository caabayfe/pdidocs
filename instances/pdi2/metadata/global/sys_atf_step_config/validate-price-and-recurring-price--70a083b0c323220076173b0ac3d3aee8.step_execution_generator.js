
	(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_RUNNING_PRICE_VALIDATION = "Running catalog item price validations";
	var MESSAGE_KEY_VALIDATION_STEP = "Validating {0} of the catalog item";
	var MESSAGE_KEY_ERROR_CART_NOT_FOUND = "ERROR: Cannot validate price of the item";
	var MESSAGE_KEY_ERROR_PRICE_DISABLED = "ERROR: Cannot validate price of the item. Price details not visible on cart";
	var MESSAGE_KEY_FAILURE_EXPECTED = "FAILURE: Expected {0} to be {1} but is {2}";
	var MESSAGE_KEY_FAILURE_VALIDATION = "FAILURE: Validation failed on one or more pricing details";
	var MESSAGE_KEY_SUCCESS_VALIDATED = "SUCCESS: Successfully validated pricing details of the catalog item";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_RUNNING_PRICE_VALIDATION, MESSAGE_KEY_VALIDATION_STEP, MESSAGE_KEY_ERROR_CART_NOT_FOUND, MESSAGE_KEY_ERROR_PRICE_DISABLED, MESSAGE_KEY_FAILURE_EXPECTED, MESSAGE_KEY_FAILURE_VALIDATION, MESSAGE_KEY_SUCCESS_VALIDATED]);


	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_RUNNING_PRICE_VALIDATION]);

	function assertField(expectedVal, actualVal, failMsg) {
		if (expectedVal != actualVal) {
			stepResult.success = false;
			stepResult.message += (stepResult.message ? "\n" : "") + failMsg;
		}
	}
	function validatePriceOfItem() {
		stepResult.success = true;
		stepResult.message = "";
		var failMsg = "";

		if (step.inputs.price) {
			failMsg = formatMessage(messageMap[MESSAGE_KEY_FAILURE_EXPECTED], 'price', step.inputs.price, g_cart.price_subtotal);
			assertField(step.inputs.price, g_cart.price_subtotal, failMsg);
		}

		if (step.inputs.recurring_price) {
			failMsg = formatMessage(messageMap[MESSAGE_KEY_FAILURE_EXPECTED], 'recurring price', step.inputs.recurring_price, g_cart.recurring_price_subtotal);
			assertField(step.inputs.recurring_price, g_cart.recurring_price_subtotal, failMsg);
		}

		if (step.inputs.recurring_frequency) {
			failMsg = formatMessage(messageMap[MESSAGE_KEY_FAILURE_EXPECTED], 'recurring frequency', step.inputs.recurring_frequency, g_cart.recurring_frequency_subtotal);
			assertField(step.inputs.recurring_frequency, g_cart.recurring_frequency_subtotal, failMsg);
		}

		if (stepResult.success) {
			g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_SUCCESS_VALIDATED]);
			stepResult.message = messageMap[MESSAGE_KEY_SUCCESS_VALIDATED];
			step.defer.resolve();
		} else {
			g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_FAILURE_VALIDATION]);
			step.defer.reject();
		}
	}

	var g_cart = g_ui_testing_util.getTestIFrameWindow().g_cart;
	if (!g_cart || !g_cart.showCart) {
		g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_ERROR_CART_NOT_FOUND]);
		stepResult.success = false;
		stepResult.message = messageMap[MESSAGE_KEY_ERROR_CART_NOT_FOUND];
		step.defer.reject();
	} else
		validatePriceOfItem();
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
