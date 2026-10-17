(function executeRule(current, previous) {
	var apiInfo = new RESTAPIServiceInfo();
	var sr = new sn_ws.ServicesRetriever();
	var svcInfos = sr.getServices("", true);
	if (svcInfos.length > 0) {
		g_scratchpad.svcOptionInfos = apiInfo.buildSvcOptionInfos(svcInfos);
	} else {
		gs.addErrorMessage("Failed to retrieve list of REST APIs");
	}
})(current, previous);
