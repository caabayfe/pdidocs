(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var credTestRunId = request.pathParams.cred_test_run_id;
	var result = new SubnetAcceleratorManager().getTestCredentialsResult(credTestRunId);

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);
})(request, response);
