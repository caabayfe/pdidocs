(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	//Perform input validations
	var cart = new sn_sc.CartJS();
	var response_body = {};
	if (cart.isEmpty())
		throw new sn_ws_err.BadRequestError("Cannot checkout an empty Cart");
	
	//Checkout cart
	try {
		response_body = cart.checkoutCart();
	} catch(e) {
		gs.debug(e);
		var catalogExceptionUtils = new global.CatalogExceptionUtils();
		if(catalogExceptionUtils.isCartException(e)) {
			response.setStatus(400);
			response_body = catalogExceptionUtils.handleCartExceptionInPortal(e);
		} else
			throw new sn_ws_err.ServiceError('Error during checkout');
	}
	return response_body;
})(request, response);
