(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var queryParams = request.queryParams;
	var ciSysId = queryParams.ci_id;
	var message = ''+queryParams.message;
	var errCode = queryParams.hasOwnProperty('error_code') ? queryParams.error_code : 'SN-1570';
	var serviceError = null;

	
	var validateParams = function(ciSysId, errCode) {
		var displayMessage = "";
		
		if (message.length > 4095) {
			displayMessage = gs.getMessage('Cannot perform the action because the error message is too long.'); 
			serviceError = SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
			return false;
		}
		
		var gr = new GlideRecord("automation_error_code");
		gr.addQuery("code", errCode);
		gr.query();
		if (!gr.next()) {
			displayMessage = gs.getMessage('Cannot perform the action because the error code is invalid.'); 
			serviceError = SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
			return false;
			
		}
		return true;
	};

	if (validateParams(ciSysId, errCode))
		(new sn_svcerr.ErrorMgrScript()).addRejectMessage(ciSysId, errCode, message);
	else
		return serviceError;
	
		
	

})(request, response);
