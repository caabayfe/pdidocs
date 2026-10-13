(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	var results = scheduleConfig.getActiveMidsByProvider(request.pathParams.provider,request.pathParams.filter);
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.midsInfo);
	
})(request, response);
