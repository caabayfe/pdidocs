(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	var results = scheduleConfig.getMidSelectionMethods();
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.midSelectTypes);
	
})(request, response);
