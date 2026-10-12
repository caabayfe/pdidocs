function transform(input) {
	var WdfUtilAPI = new sn_wdf_token.WdfUtil();
	var WdfDashboardUtilAPI = new sn_wdf_token.WdfDashboardUtil();

	var tokensEntitled = WdfDashboardUtilAPI.getTotalEntitlementPurchaseQuantities();
	var totalTokensUsed = WdfDashboardUtilAPI.getTotalTokensUsed();

	var tokenDiff = tokensEntitled - totalTokensUsed;

	if (tokenDiff < 0) {
		tokenDiff = 0;
	}
	
	return WdfUtilAPI.formatNumberWithSuffix(tokenDiff);
}
