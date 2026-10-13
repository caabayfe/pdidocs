(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var scheduleConfig = new CloudDiscoveryScheduleConfig();
    var results = scheduleConfig.getCredentialsByProvider(request.pathParams.provider);
    
    response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.credentialsInfo);
    
})(request, response);
