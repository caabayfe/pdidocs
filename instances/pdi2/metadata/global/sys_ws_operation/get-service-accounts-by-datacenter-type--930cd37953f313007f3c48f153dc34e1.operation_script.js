(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scheduleConfig = new CloudDiscoveryScheduleConfig();
	var results = scheduleConfig.getServiceAccountsByDatacenterType(request.pathParams.datacenter_type);
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.allServiceAccountsInfo);
	
})(request, response);
