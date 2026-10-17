function transform(input){
	var WdfUtilAPI = new sn_wdf_token.WdfUtil();
	var WdfDashboardUtilAPI = new sn_wdf_token.WdfDashboardUtil();

	return WdfUtilAPI.formatNumberWithSuffix(WdfDashboardUtilAPI.getDailyAverageUsage());
}
