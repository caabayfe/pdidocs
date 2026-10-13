(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var manager = new DiscoveryResultManager();
	var results = manager.runSchedule(request.pathParams.schedule_id);
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results);
})(request, response);
