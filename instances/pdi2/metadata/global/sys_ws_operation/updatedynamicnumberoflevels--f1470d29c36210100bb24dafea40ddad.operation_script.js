(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payloads = request.body.data;

	var ServiceGenerator = new CreateOrUpdateITService();
	try{
		ServiceGenerator.updateDynamicNumberOfLevels(payloads.serviceId, payloads.levels);
		response.setContentType('application/json');
		response.setStatus(200);
	} catch(err){
		var exp = new sn_ws_err.BadRequestError(err);
		response.setError(exp);
	}
})(request, response);
