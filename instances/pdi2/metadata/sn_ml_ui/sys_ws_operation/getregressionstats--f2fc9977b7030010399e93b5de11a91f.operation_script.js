(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var solution_id = decodeURI(request.pathParams.solution_id);
	if (solution_id) {
		var queryParams = request.queryParams;
		var result = [];
		return new mlRegressionSolutionStats().getStatsData(solution_id);
	} else {
		return sn_ws_err.BadRequestError("Solution id not present");
	}

})(request, response);
