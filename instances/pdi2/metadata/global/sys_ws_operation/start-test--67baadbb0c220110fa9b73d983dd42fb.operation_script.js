(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	function isValidRequest(data) {
		return true;
	}

	var data = request.body.data;
	var testId = request.pathParams.testId;

	if (!isValidRequest(data)) {
		response.setStatus(400);
		response.setBody({ errorMessage: "Invalid request, missing required fields." });
		return;
	}

	var executionId = new sn_atf.ExecuteUserTest()
		.setTestRecordSysId(testId)
		.start();

	var result = { executionId: executionId };

	response.setStatus(201);
	response.setBody(result);

})(request, response);
