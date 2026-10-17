(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // implement resource here
	
	var queryParam = request.queryParams;
	var sourceApplId = request.queryParams.source_app[0];
	var filterMappingRelevancy = queryParam.filter_mapping_relevancy == 'true';

	if(!sourceApplId){
		var displayMessage = gs.getMessage('Cannot perform the action because the source application is invalid'); 
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}
	
	/* eslint-disable no-undef */
	var errManager = new sn_svcerr.ErrorMgrScript(sourceApplId);
	var domainHelper = new sn_svcerr.ScopedDomainHelper();
	
	var result = {
		list: [],
		isLeafDomain: domainHelper.currentDomainIsLeaf() //DEF0166519
	};
	
	if (result.isLeafDomain) {
	
		/* eslint-enable no-undef */
		if(queryParam.aggregate_errors && queryParam.aggregate_errors[0] != 'false') 
			errManager.updateAllCounts();

		var errCategories = errManager.getCategories(filterMappingRelevancy);


		errCategories.forEach(function(errCat) {
			result.list.push({
				id:                  errCat.getId(),
				name:                errCat.getName(),
				errorNumber:         errCat.getTotalErrors(),
				servicesImpacted:    errCat.getTotalAffectedItems(),
				icon:                errCat.getIcon(),
				trend:               errCat.getTrend()
				//order:
			});
		});
		result.lastAggregationTime = ErrorActionHelper.getLastAggregationTime(sourceApplId);
	}
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);
})(request, response);
