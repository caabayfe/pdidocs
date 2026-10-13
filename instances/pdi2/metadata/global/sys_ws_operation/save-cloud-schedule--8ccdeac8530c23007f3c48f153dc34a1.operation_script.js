(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = new CloudDiscoveryScheduleConfig().saveCloudSchedule(request.body.data);
	
	if (result.errorDetail) {
		var myError = new sn_ws_err.ServiceError();
		myError.setStatus(418);
		myError.setMessage("Unable to process request");
		myError.setDetail(result.errorDetail);
		response.setError(myError);
	} else {
		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody(result);
	}
	
})(request, response);
