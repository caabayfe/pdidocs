(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var result = new DiscoveryAcceleratorManager().assignLocationToRouters(request.body.data);

    response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
