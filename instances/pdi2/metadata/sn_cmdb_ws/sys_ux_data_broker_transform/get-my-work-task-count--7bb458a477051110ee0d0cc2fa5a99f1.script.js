function transform(input) {
	var manualRefresh = false;
	if (global.JSUtil.notNil(input) && input.manualRefresh === true) {
		manualRefresh = true;
	}

	return new sn_cmdb_ws.CMDBWsLandingPageUtil().getMyWorkTaskCount(manualRefresh);
}
