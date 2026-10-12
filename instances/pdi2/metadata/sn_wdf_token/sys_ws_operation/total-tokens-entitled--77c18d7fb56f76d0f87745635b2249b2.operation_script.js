(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var WdfUtilAPI = new sn_wdf_token.WdfUtil();
	var WdfDashboardUtilAPI = new sn_wdf_token.WdfDashboardUtil();
	var result = WdfUtilAPI.formatNumberWithSuffix(WdfDashboardUtilAPI.getTotalEntitlementPurchaseQuantities());
	response.setBody({result: result});
})(request, response);
