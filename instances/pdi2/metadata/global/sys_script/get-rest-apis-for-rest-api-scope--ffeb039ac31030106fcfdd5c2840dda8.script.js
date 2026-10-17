(function executeRule(current, previous) {
	var apiInfo = new RESTAPIServiceInfo();
	var svcInfos = apiInfo.getSeviceInfos();
	if (svcInfos.length > 0) {
		g_scratchpad.svcOptionInfos = apiInfo.buildSvcOptionInfos(svcInfos);
	} else {
		gs.addErrorMessage(gs.getMessage("Failed to retrieve list of REST APIs"));
	}

})(current, previous);
