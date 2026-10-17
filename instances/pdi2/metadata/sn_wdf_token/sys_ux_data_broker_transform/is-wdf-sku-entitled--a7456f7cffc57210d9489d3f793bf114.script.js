function transform() {
		var WdfDashboardUtilAPI = new sn_wdf_token.WdfDashboardUtil();
		return WdfDashboardUtilAPI.instanceHasWdfEntitlement();
}
