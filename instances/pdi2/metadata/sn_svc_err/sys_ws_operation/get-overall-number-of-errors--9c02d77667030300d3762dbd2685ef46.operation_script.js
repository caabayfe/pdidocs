(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var sourceApplId = request.queryParams.source_app;
	if(!sourceApplId){
		displayMessage = gs.getMessage('Cannot perform the action because the source application is invalid');
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	var errManager = new sn_svcerr.ErrorMgrScript(sourceApplId);
	return errManager.getOverallNumberOfErrors();

})(request, response);
