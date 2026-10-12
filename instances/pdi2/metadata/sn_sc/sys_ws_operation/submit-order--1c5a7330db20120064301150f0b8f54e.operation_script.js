(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var request_body = request.body.nextEntry();
	var itemId = '' + request_body.sysparm_id;
	var catUtil = new RestCatalogUtil();
	for (var key in request_body.variables)
		if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
			request_body.variables[key] = catUtil.getFieldValueAsString(key, request_body.variables[key], itemId);
	
	var cart = new sn_sc.CartJS();
	var conflictingCartDomain = cart.findConflictingDomain();
	if (conflictingCartDomain)
		throw new sn_ws_err.BadRequestError(gs.getMessage("Your cart has item(s) belonging to the '{0}' domain. Please change the domain to continue with the checkout.", conflictingCartDomain));
		
	if(cart.isEmpty())
		throw new sn_ws_err.BadRequestError("Cart is empty!");

	var response_body = {};
	try {
		response_body = cart.submitOrder(request_body);
	} catch (e) {
		gs.debug(e);
		var catalogExceptionUtils = new global.CatalogExceptionUtils();
		if(catalogExceptionUtils.isCartException(e)) {
			response.setStatus(400);
			response_body = catalogExceptionUtils.handleCartExceptionInPortal(e);
		} else
			throw new sn_ws_err.ServiceError('Error during submit');
	}
	return response_body;
})(request, response);
