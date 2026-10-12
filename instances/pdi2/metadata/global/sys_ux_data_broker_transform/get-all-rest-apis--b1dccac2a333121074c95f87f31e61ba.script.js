function transform(input) {
	var apiInfo = new RESTAPIServiceInfo();
	var svcInfos = apiInfo.getSeviceInfos();
  
	if (svcInfos.length == 0) {
		gs.addErrorMessage(gs.getMessage("Failed to retrieve list of REST APIs"));
		return [];
	}
	var apisFullData = apiInfo.buildSvcOptionInfos(svcInfos) || {};
	var apisCustomData = [];
	for(var apiName in apisFullData) {
		var api = {};
		api["sys_id"] = apisFullData[apiName]["sysId"];
		api["label"] = apiName;
		api["id"] = apisFullData[apiName]["route"]+ "(" + apiName + ")";
		api["path"] = apisFullData[apiName]["route"];
		apisCustomData.push(api);
	}
	return apisCustomData;
}
