(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var cart = new sn_sc.CartJS();
	return cart.checkoutSummary();

})(request, response);
