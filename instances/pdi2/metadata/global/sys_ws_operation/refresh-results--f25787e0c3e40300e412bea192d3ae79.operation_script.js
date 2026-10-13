(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var manager = new DiscoveryResultManager();
	var schedules = (request.body.data.schedules && JSON.parse(request.body.data.schedules)) || '';
	var result = manager.refreshResults(schedules);
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
