(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	if(request.body.data) {
		var data = request.body.data;
		var serviceAccountSysId = data.serviceAccountId;
		var discoverDatacenters = data.isRefreshDatacenter;	
		var midServer = data.selectedMid;
		var subAccounts = data.selectedMemberAccounts;
		var clusterSelected = data.isClusterSelected ? JSUtil.toBoolean(data.isClusterSelected) : false;
		if (clusterSelected) 
			midServer = new CloudResourceDiscoveryUtil().getRandomMidFromCluster(data.selectedMid);
		

		var result = scheduleConfig.getOrRefreshDatacenters(serviceAccountSysId, discoverDatacenters, midServer, subAccounts);
		if (result.hasOwnProperty('errorDetail')) {
			var myError = new sn_ws_err.ServiceError();
			myError.setStatus(418);
			myError.setMessage(gs.getMessage("Unable to process request"));
			myError.setDetail(result.errorDetail);
			response.setError(myError);
		} else if (result.hasOwnProperty('resultData')) {
			response.setStatus(200);
			response.setContentType('application/json');
			response.setBody(result.resultData);
		}
	}
	else {
			var myError = new sn_ws_err.ServiceError();
			myError.setStatus(422);
			myError.setMessage(gs.getMessage("Unable to process request"));
			response.setError(myError);
	}
})(request, response);
