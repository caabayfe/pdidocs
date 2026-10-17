(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var solution_id = decodeURI(request.pathParams.solution_id);
	if (solution_id) {
		var queryParams = request.queryParams;
		var result = [];
		return new ML_UI().getSolutionData(solution_id, queryParams);
	} else {
		return sn_ws_err.BadRequestError("Solution id not present");
	}

})(request, response);
