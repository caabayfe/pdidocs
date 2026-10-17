(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new InteractiveAnalysisUtil();
	try {
		return util.saveDefaultValues(request.pathParams.tableName, request.queryParams, request.body.data, response);
	} catch (e) {
		return util.restErrorHandler(e, response);
	}
})(request, response);
