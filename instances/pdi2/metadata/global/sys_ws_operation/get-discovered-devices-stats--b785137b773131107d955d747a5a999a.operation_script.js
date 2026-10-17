(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var manager = new DiscoveryResultManager();
	var stats = manager.getDiscoveredDevicesStats();

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(stats);

})(request, response);
