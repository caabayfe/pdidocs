(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var myError = new sn_ws_err.ServiceError();
	var dataObject = request.body.data;
	var accountSysId = dataObject.serviceAccountId;
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	if (gs.nil(accountSysId)) {
		gs.error("Missing mandatory input parameter - Service Account Sys_Id");
		myError.setStatus(418);
		myError.setMessage("Missing mandatory input parameter - Service Account Sys_Id" );
		myError.setDetail("Here are the details of the arguments passed to this script");
						  //+ JSON.stringify(accountSysId, null, 2));
		return myError;
	} else {
		var responseObj = {};
		responseObj['service_account'] = scheduleConfig.getServiceAccountDetails(accountSysId);
		responseObj['datacenters'] = (scheduleConfig.getDatacentersForServiceAccount(accountSysId)).datacentersList;
		if (responseObj && responseObj.service_account.isMasterAccount)
			responseObj['membersInfo'] = scheduleConfig.getMemberServiceAccounts(accountSysId, false)['memberAccounts'];
		
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(responseObj);
		return response;
	}
	
})(request, response);
