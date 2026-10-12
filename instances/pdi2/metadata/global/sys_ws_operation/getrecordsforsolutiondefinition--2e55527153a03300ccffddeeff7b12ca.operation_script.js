(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var solution_id = decodeURI(request.pathParams.solution_name);
	if (solution_id) {
		return new MLTriggerAutoTrain().getSolutionRecords(solution_id);
	} else {
		return sn_ws_err.BadRequestError("Solution id not present");
	}

})(request, response);
