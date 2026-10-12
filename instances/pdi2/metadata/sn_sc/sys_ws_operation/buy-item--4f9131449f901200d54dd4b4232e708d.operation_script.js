(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {	
	var request_body = request.body.nextEntry();
	var quantity = '' + request_body.sysparm_quantity;
	var noValidation =  (request_body.sysparm_no_validation == 'true');

	if (!/^\+?([0-9]*)$/.test(quantity))
		throw new sn_ws_err.BadRequestError("Invalid Quantity value");
	else
		request_body.sysparm_quantity = quantity;

	var itemId = '' + request.pathParams.sys_id;
	request_body.sysparm_id = itemId;
	var catItem = new sn_sc.CatItem(itemId);
	if (!catItem.canView())
		throw new sn_ws_err.BadRequestError("Security constraints prevent ordering of Item");

	var catUtil = new RestCatalogUtil();
	for (var key in request_body.variables)
		if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
			request_body.variables[key] = catUtil.getFieldValueAsString(key, request_body.variables[key], itemId);

	if (!noValidation) {
		if (!catUtil.checkMandatoryVariables(itemId, request_body.variables))
			throw new sn_ws_err.BadRequestError('Mandatory Variables are required');
	}
	var messages = catUtil.validateVariableRegex(itemId, request_body.variables);
	if (messages && messages.length > 0) {
		var errorResponse = {};
		errorResponse.errMsg = messages.join();
		response.setStatus(400);
		return errorResponse;
	}

	var mrvsErrorMessages = catUtil.validateMaxRowCountMultiRowVS('sc_cat_item', itemId, itemId, request_body.variables); 
	if (mrvsErrorMessages && mrvsErrorMessages.length > 0) {
		var errors = mrvsErrorMessages.join();
		throw new sn_ws_err.BadRequestError(errors);
	}
	var cartName = "cart_" + gs.generateGUID() + "_" + itemId;
	var cart = new sn_sc.CartJS(cartName);
	request_body.sysparm_cart_name = cartName;
	var response_body = {};
	try {	
		response_body = cart.orderNow(request_body);
	} catch(e) {
		gs.debug(e);
		var catalogExceptionUtils = new global.CatalogExceptionUtils();
		if(catalogExceptionUtils.isCartException(e))
			response_body = catalogExceptionUtils.handleCartExceptionInPortal(e);
		else
			throw new sn_ws_err.ServiceError('Invalid Request');
	}
	if (response_body.errMsg)
		response.setStatus(400);

	return response_body;
})(request, response);
