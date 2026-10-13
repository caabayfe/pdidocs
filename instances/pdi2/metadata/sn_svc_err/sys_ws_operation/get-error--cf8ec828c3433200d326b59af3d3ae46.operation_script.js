(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var ERROR_TABLE = "automation_error_msg";
	var errorId = request.pathParams.id;
	
	var application_id = request.queryParams.app_id;
	var encoded_query = request.queryParams.encoded_query;
	
	if(!application_id) {
		displayMessage = gs.getMessage("Cannot get error, missing mandatory field app_id"); 
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}
	
	if(!encoded_query) {
		displayMessage = gs.getMessage("Cannot get error, missing mandatory field encoded_query"); 
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	var errorGr = new GlideRecord(ERROR_TABLE);
	if(!errorGr.get(request.pathParams.id) || !errorGr.isValidRecord()) {
		var displayMessage = gs.getMessage('Cannot get an error object because id is invalid'); 
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}
	
	var errorManager = new sn_svcerr.ErrorMgrScript(application_id);
	var errorCode = errorManager.getErrorCode(errorGr.error_code);
	
	var errorCodeExtract = null;
	
	if (errorCode != null)
		errorCodeExtract = {
			id: (errorCode.getId() || ''),
			name: (errorCode.getName() || ''),
			code: (errorCode.getCode() || ''),
			description: (errorCode.getDescription() || '')
		};

	var errorObj = {
		id: errorGr.getUniqueValue(),
		status: errorGr.getDisplayValue("status"),
		statusCode: errorGr.getValue("status"),
		host: errorGr.getDisplayValue("host"),
		errorCode: errorCodeExtract,
		latest_action: errorGr.latest_action ? errorGr.latest_action.is_global ? "global" : "selected" : null,
		discoveryFailureMessage: errorGr.rediscovery_failure_msg
	};

	if(errorObj.statusCode == 3) {
		errorObj.errorsStillExistsForCI = errorManager.hasActiveErrors(errorObj.id);
	}

	if (errorCodeExtract) {
		errorObj.totalErrors = errorManager.countErrors(encoded_query, false);
		errorObj.resolvedErrors = errorManager.countErrors(encoded_query, true);
	}

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(errorObj);
})(request, response);
