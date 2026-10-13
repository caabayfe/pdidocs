(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var queryParam = request.queryParams;
	var sourceApplId = request.queryParams.source_app[0];
	var instanceId = request.queryParams.instance_id;

	var displayMessage;

	if(!sourceApplId){
		displayMessage = gs.getMessage('Cannot perform the action because the source application is invalid');
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	if(!instanceId){
		displayMessage = gs.getMessage('Cannot perform the action because the instance id is invalid');
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	/* eslint-disable no-undef */
	var errManager = new sn_svcerr.ErrorMgrScript(sourceApplId);
	/* eslint-enable no-undef */
	if(queryParam.aggregate_errors && queryParam.aggregate_errors[0]!='false')
		errManager.updateAllCounts();

	var errCategories = errManager.getInstanceCategories(instanceId);

	var result = {list:[]};
	errCategories.forEach(function(errCat) {
		result.list.push({
			id:                  errCat.getId(),
			name:                errCat.getName(),
			errorNumber:         errCat.getTotalErrors(),
			icon:                errCat.getIcon()
		});
	});
	result.lastAggregationTime = ErrorActionHelper.getLastAggregationTime(sourceApplId);

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
