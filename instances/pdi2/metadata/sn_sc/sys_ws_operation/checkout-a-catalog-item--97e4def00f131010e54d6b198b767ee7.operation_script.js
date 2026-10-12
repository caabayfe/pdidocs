(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	try {
		var itemID = request.pathParams.sys_id;
		var checkoutItem = sn_sc.CatalogItemVersioningService.checkout(itemID);
		return {
			result: checkoutItem
		};
	} catch (e) {
		gs.debug(e.getMessage());
		return {
			errMsg: gs.getMessage('Operation Failed')
		};
	}
})(request, response);
