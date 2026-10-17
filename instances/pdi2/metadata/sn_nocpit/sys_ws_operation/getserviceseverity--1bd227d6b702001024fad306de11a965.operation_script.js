(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var params = request.queryParams || {};
	var serviceId = params.serviceId || '';
	var timestamp = params.timestamp || '';
	
	var mgr = new sn_nocpit.ScopedServiceMapManager();
	
	var responseString = String(mgr.getServiceSeverity(serviceId, timestamp));
	response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(responseString);
	
})(request, response);
