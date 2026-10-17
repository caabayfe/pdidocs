(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = new SubnetAcceleratorManager().triggerSubnetDiscovery();

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);
})(request, response);
