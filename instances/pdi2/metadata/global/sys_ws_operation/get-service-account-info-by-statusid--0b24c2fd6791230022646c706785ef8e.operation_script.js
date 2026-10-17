(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var myError = new sn_ws_err.ServiceError();
	var dataObject = request.body.data;
    var statusSysId = dataObject.statusId;
	var accountSysId = dataObject.serviceAccountId;
	var isClusterSelected = dataObject.clusterSelected ? JSUtil.toBoolean(dataObject.clusterSelected) : false;
	var selectedMid = dataObject.midServer && dataObject.midServer != 'null' ? dataObject.midServer : null;
	
	if(isClusterSelected)
		selectedMid = new CloudResourceDiscoveryUtil().getRandomMidFromCluster(selectedMid);
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	
	if (gs.nil(statusSysId)) {
		gs.error(gs.getMessage("Missing mandatory input parameter - Discovery Status Sys_Id"));
		myError.setStatus(418);
		myError.setMessage("Missing mandatory input parameter - Discovery Status Sys_Id");
		myError.setDetail(gs.getMessage("Missing mandatory input parameter - Discovery Status Sys_Id"));
		return myError;
	} else {
		var statsGr = new GlideRecord('discovery_status');
		if (statsGr.get(statusSysId)) {
			var results = scheduleConfig.getServiceAccountInfoByStatusId(statusSysId, accountSysId, selectedMid);
			if (!(results.valid)){
				var msg = "Here are the details of the arguments passed to this script " + JSON.stringify(statusSysId, null, 2);
				myError.setStatus(418);
				myError.setMessage(gs.getMessage("Unable to process request"));
				myError.setDetail(gs.getMessage('{0}', results.statusResult.message || msg ));
				response.setError(myError);
			} else {
				response.setStatus(200);
				response.setContentType('application/json');
				response.setBody(results);
				return response;
			}
			
		} else {
			gs.error(gs.getMessage("Cannot find discovery status for provided sys id[{0}]", statusSysId));
			myError.setStatus(418);
			myError.setMessage(gs.getMessage("Cannot find discovery status for provided sys id [{0}]", statusSysId));
			return myError;
		}
	}
})(request, response);
