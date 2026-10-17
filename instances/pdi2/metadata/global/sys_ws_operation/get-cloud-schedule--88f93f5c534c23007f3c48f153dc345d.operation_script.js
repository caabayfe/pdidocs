(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	var results = scheduleConfig.getCloudSchedule(request.pathParams.scheduleId);
	
	if (results.errorDetail) 
		results = {};

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results);
	
})(request, response);
