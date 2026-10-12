(function executeRule(current, previous /*null when async*/) {

		var soapRetr = new sn_ws.SOAPAPIRetriever();
		var svcInfos = soapRetr.getAPIs();
		var svcOptionInfos = {};

	if (svcInfos.length > 0) {
		for (var idx in svcInfos) {
			var opInfo = {};
			opInfo.apiname = svcInfos[idx].getAPIName();
			opInfo.apiscopedName = svcInfos[idx].getAPIScopedName();
			opInfo.sysId = svcInfos[idx].getSysId();

			svcOptionInfos[svcInfos[idx].getAPIName()] = opInfo;
		}
	}
	var tableApiOption = {};
	var tableApi = 'Table API';
	tableApiOption.apiname = tableApi;
	tableApiOption.apiscopedName = tableApi;

	svcOptionInfos[tableApi] = tableApiOption;
	g_scratchpad.SOAPAPIInfos = svcOptionInfos;
})(current, previous);
