(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var cart = new sn_sc.CartJS("saved_items");
	return cart.checkoutSummary(true);

})(request, response);
