(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var scheduleConfig = new CloudDiscoveryScheduleConfig();
    var results = scheduleConfig.getDiscoveryProvidersList();
    
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.discoveryProviders);
    
})(request, response);
