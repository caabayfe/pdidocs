(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	var results = scheduleConfig.getAllActiveMids();
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.mids);
	
})(request, response);
