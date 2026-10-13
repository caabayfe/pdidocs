(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	var results = scheduleConfig.getMidServerClustersForProvider(request.pathParams.provider);	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.midClusters);
	
})(request, response);
