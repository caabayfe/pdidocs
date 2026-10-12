(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new InteractiveAnalysisUtil();
	try {
		return util.getDefaultValues(request.pathParams.tableName, request.queryParams, response);
	} catch (e) {
		return util.restErrorHandler(e, response);
	}

})(request, response);
