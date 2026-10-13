(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryParam = request.queryParams;
	var sourceApplId = request.queryParams.source_app;
	var categoryId   = request.queryParams.category;
	var instanceId   = request.queryParams.instance_id;

	var displayMessage;

	if(!sourceApplId){
		displayMessage = gs.getMessage('Cannot perform the action because the source application is invalid');
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	if(!categoryId){
		displayMessage = gs.getMessage('Cannot perform the action because category is invalid');
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	if(!instanceId){
		displayMessage = gs.getMessage('Cannot perform the action because instance is invalid');
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	/* eslint-disable no-undef */
	var errManager = new sn_svcerr.ErrorMgrScript(sourceApplId);
	/* eslint-enable no-undef */
	if(queryParam.aggregate_errors && queryParam.aggregate_errors[0]!='false')
		errManager.updateAllCounts();

	var errCodes = errManager.getInstanceErrorCodes(instanceId, categoryId);

	var result = {list:[]};

	var errAction = sn_svc_err.ErrorActionHelper;
	errCodes.forEach(function(errCode) {
		result.list.push(errAction.getErrorCodeObj(errCode));
	});
	result.lastAggregationTime = ErrorActionHelper.getLastAggregationTime(sourceApplId);

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
