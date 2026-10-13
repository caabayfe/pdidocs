(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var manager = new DiscoveryScheduleManager();
	var results = manager.getScheduleResults(request.pathParams.schedule_id);
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results);
})(request, response);
