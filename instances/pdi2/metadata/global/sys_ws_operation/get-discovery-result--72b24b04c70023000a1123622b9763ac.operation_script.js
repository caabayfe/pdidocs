(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var myError = new sn_ws_err.ServiceError();
	var query = request.queryParams;
	var statusSysId = query.hasOwnProperty('statusSysId') ? query.statusSysId : '';
	if (gs.nil(statusSysId)) {
		gs.error("getDiscoveryResult- Missing mandatory input statusSysId[{0}]", statusSysId);
		myError.setStatus(400);
		myError.setMessage("refreshDatacenters -Missing mandatory statusSysId input parameters" );
		return myError;
	}	
	
	var cloudScript = new CloudWizardDiscovery();
	var obj = cloudScript.getDiscoveryResult(statusSysId);
	


	return obj; 
})(request, response);
