(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var executionId = new NowAssistDiagnosticExcecutor().execute(request.body.data.diagnostic);

	return {
		"diagnosticExecutionId": executionId
	};

})(request, response);
