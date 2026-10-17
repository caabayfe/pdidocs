(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {

	var MESSAGE_KEY_SET_QUANTITY = "Setting quantity to {0}";
	var MESSAGE_KEY_ERROR_QUANTITY_HANDLER = "ERROR: Cannot find quantity handler on item";
	var MESSAGE_KEY_ERROR_CANNOT_SET_QUANTITY = "ERROR: Cannot set quantity on the item";
	var MESSAGE_KEY_QUANTITY_SET_SUCCESSFUL = "Successfully set quantity of the item to {0}";
	var MESSAGE_KEY_QUANTITY_ERROR = "FAILURE: Expected quantity value to be {0} but found {1}";
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_SET_QUANTITY, MESSAGE_KEY_ERROR_QUANTITY_HANDLER, MESSAGE_KEY_ERROR_CANNOT_SET_QUANTITY, MESSAGE_KEY_QUANTITY_SET_SUCCESSFUL, MESSAGE_KEY_QUANTITY_ERROR]);
	
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_SET_QUANTITY], step.inputs.quantity));
	
	var sucessMessage = "";
	var failureReason = "";
	
	function executeSetQuantity() {
		if (g_cart.setQuantity && typeof g_cart.setQuantity === 'function') {
			g_cart.setQuantity(step.inputs.quantity);
			var quantityActual = g_cart.getQuantity();
			if (quantityActual == step.inputs.quantity) {
				sucessMessage = formatMessage(messageMap[MESSAGE_KEY_QUANTITY_SET_SUCCESSFUL], [step.inputs.quantity]);
				g_ui_testing_util.setTestStepStatusMessage(sucessMessage);
				stepResult.success = true;
				stepResult.message = sucessMessage;
				step.defer.resolve();
			} else {
				failureReason = formatMessage(messageMap[MESSAGE_KEY_QUANTITY_ERROR], [step.inputs.quantity, quantityActual]);
				g_ui_testing_util.setTestStepStatusMessage(failureReason);
				stepResult.sucess = false;
				stepResult.message = failureReason;
				step.defer.reject();
			}
		} else {
			failureReason = messageMap[MESSAGE_KEY_ERROR_QUANTITY_HANDLER];
			g_ui_testing_util.setTestStepStatusMessage(failureReason);
			stepResult.success = false;
			stepResult.message = failureReason;
			step.defer.reject();
			return;
		}
	}

	var g_cart = g_ui_testing_util.getTestIFrameWindow().g_cart;
	if (!g_cart || !g_cart.showCart) {
		failureReason = messageMap[MESSAGE_KEY_ERROR_CANNOT_SET_QUANTITY];
		g_ui_testing_util.setTestStepStatusMessage(failureReason);
		stepResult.success = false;
		stepResult.message = failureReason;
		step.defer.reject();
	} else
		executeSetQuantity();
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult,assertionObject);
