(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var manager = new DiscoveryResultManager();
	var inProgressDiscoveries = manager.getInProgressDiscoveries();

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(inProgressDiscoveries);
})(request, response);
