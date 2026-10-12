(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var queryParams = request.queryParams;

	var minCount = getParam(queryParams, "minCount");
	var maxCount = getParam(queryParams, "maxCount");
	var offset = getParam(queryParams, "offset");
	var numRowsPerPage = getParam(queryParams, "numRows");

	//var records = appEngineCompliance.getAppEngineRolesStatsOnInstance(minCount, maxCount);
		
	var roles = SNC.AppEngineLicensingUsage.getAppEngineRolesStatsOnInstance(minCount, maxCount, offset, numRowsPerPage);
	var records = JSON.parse(roles);
	//gs.info("Total App Engine license roles on instance : " + records.length);	
	
	if (records.length == 0)
		response.setStatus(204);
	else {
		response.setStatus(200);
		response.setBody(records);
	}
	
	function getParam(rParams, key) {
		if (key in rParams)
			return rParams[key];
		return "";
	}


})(request, response);
