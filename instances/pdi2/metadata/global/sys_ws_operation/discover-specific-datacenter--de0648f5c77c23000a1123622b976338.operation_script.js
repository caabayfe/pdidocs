(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var query = request.queryParams;
	var accountSysId = query.hasOwnProperty('accountSysId') ? String(query.accountSysId) : '';
	var ldcSysId = query.hasOwnProperty('ldcSysId') ? String(query.ldcSysId) : '';

	if (gs.nil(accountSysId) || gs.nil(ldcSysId)) {	
		gs.error("discoverDatacenter- Missing mandatory input accountSysId[{0}], accountSysId[{1}]", accountSysId, ldcSysId);
		var myError = new sn_ws_err.ServiceError();
		myError.setStatus(400);
		myError.setMessage("discoverDatacenter -Missing mandatory input parameters accountSysId,ldcSysId " );
		return myError;
	}
	
	var statusId = "";
	try{	
		var cloudScript = new CloudCMPPortalDiscovery();
		statusId = cloudScript.discoverDatacenter(accountSysId, ldcSysId);
	} catch(err) {
		throw Error("discoverDataCenter failed ->EXCEPTION -",  err);
	}
	
	response.setStatus(202);
	return { "statusSysId": statusId}; 
	
})(request, response);
