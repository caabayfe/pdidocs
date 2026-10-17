(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	// make script include call
    var result = {};
	var mlUtils = new PIWBMLAPIAdapter();
	var success = mlUtils.setPCData(request.body.data.solutionName, request.body.data.version, request.body.data);
	
	// on success
	if (success) {
		result.status = 'success';
		result.solutionName = request.body.data.solutionName;
		result.modelName = request.body.data.modelName;
		result.aggData = new PiwbMLHelper().getSolutionTrainingStats(result.solutionName, request.body.data.version);
		return result;
	}
	
	// on failure
	gs.error('REST: /api/piwb/piwb_api/set_pc_data, Unable to set precision/coverage values.');
	result.status_code = '500';
	result.status = 'error';
	result.message = 'PIWB precision/coverage value not set';
	return result;

})(request, response);
