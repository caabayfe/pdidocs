(function executeStep(inputs, outputs, stepResult) {

	function onSuccess(msg, params) {
		stepResult.setSuccess();
		msg = gs.getMessage(msg, params);
		stepResult.setOutputMessage(msg);
	}

	function onFailure(msg, params) {
		stepResult.setFailed();
		msg = gs.getMessage(msg, params);
		stepResult.setOutputMessage(msg);
	}

	var cart = new sn_sc.CartJS();
	if (inputs.assert_type == 'empty_cart') {
		if (cart.isEmpty())
			onSuccess("Success: Cart is empty");
		else
			onFailure("Failure: Cart is not Empty");
		return;
	}
	if (cart.isEmpty()) {
		onFailure("Failure: Cart is empty");
		return;
	}
	if (!sn_sc.CartJS.canViewRF() && inputs.requested_for) {
		onFailure('Failure: Error! User does not have access to modify requested for');
		return;
	}
	var request = {};
	request.special_instructions = inputs.special_instructions.toString();
	request.requested_for = inputs.requested_for.toString();
	request.deliver_address = inputs.delivery_address.toString();
	var order = {};
	try {
		order = cart.submitOrder(request);
	}
	catch(error) {
		onFailure('Failure: Error during checkout {0}', error);
		return;
	}
	if (GlideStringUtil.isEligibleSysID(order.request_id)) {
		onSuccess("Success: Order Placed Successufully, Request Number: '{0}'", order.request_number);
		outputs.request_id = order.request_id;
	} else if (GlideStringUtil.isEligibleSysID(order.sys_id)) {
		if (order.number)
			onSuccess("Success: Successful Checkout, Record Number: '{0}'", order.number);
		else
			onSuccess("Success: Record Submitted");
		outputs.request_id = order.sys_id;
	}
	else
		onSuccess('Success : Records Submitted.');

}(inputs, outputs, stepResult));
