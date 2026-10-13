(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var routerIp = request.pathParams.router_ip;
	var result = new SubnetAcceleratorManager().deleteRouter(routerIp);

    // implement resource here
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
