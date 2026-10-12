(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var solution_id = decodeURI(request.pathParams.solution_id);
	if (solution_id) {
		return new ClassificationBubbleChartHelper().getData(solution_id);	
	} else {
		return sn_ws_err.BadRequestError("Solution id not present");
	}

})(request, response);
