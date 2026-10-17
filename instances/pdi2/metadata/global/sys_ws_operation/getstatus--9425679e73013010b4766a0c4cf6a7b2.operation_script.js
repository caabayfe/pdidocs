(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var payloads = request.queryParams;
	var progressChecker = new AJAXProgressStatusChecker();
	try {
		var execution_id = payloads["sysparm_execution_id"][0];
		return progressChecker.getStatus(execution_id);
	} catch(err) {
		var exp = new sn_ws_err.BadRequestError(err);
		response.setError(exp);
	}

})(request, response);
