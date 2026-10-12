(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payloads = request.body.data;

	var ServiceGenerator = new CreateOrUpdateITService();
	try{
		ServiceGenerator.convertDynamicToManual(payloads.serviceId);
		response.setContentType('application/json');
		response.setStatus(200);
	} catch(err){
		response.setError(err);
	}
})(request, response);
