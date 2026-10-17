(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var cartID = request.pathParams.sys_id;
	
	var cart = new sn_sc.CartJS();
	if(!cart.canEmptyCart(cartID))
		throw new sn_ws_err.BadRequestError("Either the CartID is invalid or Security constraints prevents access to it!");
	else
		cart.empty(cartID);
	response.setStatus(204);

})(request, response);
