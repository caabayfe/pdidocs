(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var manager = new DiscoveryScheduleManager();
	var stats = manager.getServiceAccountsFilterList();

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(stats);
})(request, response);
