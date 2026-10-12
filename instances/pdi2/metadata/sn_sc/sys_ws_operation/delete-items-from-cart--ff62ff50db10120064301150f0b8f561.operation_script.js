(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var cart = new sn_sc.CartJS();
	var cartItemId = request.pathParams.cart_item_id;
	var gr = new GlideRecordSecure('sc_cart_item');
	if(!gr.get(cartItemId))
		throw new sn_ws_err.BadRequestError("Invalid Cart Item ID!");
	var grCart = new GlideRecordSecure("sc_cart");
	if(!grCart.get(gr.cart) || grCart.user != gs.getUserID())
		throw new sn_ws_err.BadRequestError("Security constraints prevents access to this item!");
	response.setStatus(204);
	return cart.remove(cartItemId);

})(request, response);
