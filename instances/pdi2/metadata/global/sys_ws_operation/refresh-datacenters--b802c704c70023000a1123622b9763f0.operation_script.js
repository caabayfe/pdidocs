(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var myError = new sn_ws_err.ServiceError();
	var query = request.queryParams;
	var accountSysId = query.hasOwnProperty('accountSysId') ? query.accountSysId : '';
	
	if (!gs.nil(accountSysId)) {	
		var statsGr = new GlideRecord('cmdb_ci_cloud_service_account');
		if (!statsGr.get( String(accountSysId) )) {
			gs.error("refreshDatacenters- can't find accountSysId[{0}]", accountSysId);
			myError.setStatus(400);
			myError.setMessage("Can't find statusId-" + accountSysId);
			return myError;
		}
		
		var cloudScript = new CloudWizardDiscovery();
		var statusId = cloudScript.refreshDatacenters(accountSysId);
		response.setStatus(202);
		return { "statusSysId": statusId}; 
	} 
	
	gs.error("refreshDatacenters- Missing mandatory input accountSysId[{0}]", accountSysId);
	myError.setStatus(400);
	myError.setMessage("refreshDatacenters -Missing mandatory accountSysId input parameters" );
	myError.setDetail("Here are the details of the arguments passed to this script" + JSON.stringify(accountSysId, null, 2));
	return myError;
})(request, response);
