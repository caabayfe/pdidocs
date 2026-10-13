(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var query = request.queryParams;
	var accountName = query.hasOwnProperty('accountName') ? query.accountName : '';
	var accountId = query.hasOwnProperty('accountId') ? query.accountId : '';
	var accountUrl = query.hasOwnProperty('accountUrl') ? query.accountUrl : '';
	var accountClassType = query.hasOwnProperty('accountClassType') ? query.accountClassType : '';
	var accountCredentialSysId = query.hasOwnProperty('accountCredentialSysId') ? query.accountCredentialSysId : '';

	var configObj = {
			"accountName" : accountName,
            "accountId": accountId,
            "accountUrl": accountUrl,
            "accountType": accountClassType,
            "accountCredentialsId": accountCredentialSysId,
	};

	if (accountClassType){
		var cloudScript = new CloudWizardDiscovery();
		var statusId = cloudScript.validateAccount(configObj);
		response.setStatus(202);
		return { "statusSysId": statusId};
	}

	gs.error("validateAccount Missing mandatory input parameters accountId[{0}], accountClassType[{1}], accountCredentialSysId[{2}]", accountId , accountClassType , accountCredentialSysId);
	var myError = new sn_ws_err.ServiceError();
	myError.setStatus(400);
	myError.setMessage("Missing one of the mandatory input parameters [accountId, accountClassType, accountCredentialSysId]" );
	myError.setDetail("Here are the details of the arguments passed to this script" + JSON.stringify(configObj, null, 2));
	return myError;
})(request, response);
