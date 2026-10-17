(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payloads = request.body.data;

	var ServiceGenerator = new CreateOrUpdateITService();
	try{
		var name = payloads.name;
		var levels = payloads.levels;
		delete payloads["name"];
		delete payloads["levels"];
		var serviceId = ServiceGenerator.createDynamicService(name, levels, payloads);
		response.setContentType('application/json');
		response.setBody({serviceId : serviceId});
		response.setStatus(200);
	} catch(err){
		var exp = new sn_ws_err.BadRequestError(err);
		response.setError(exp);
	}
})(request, response);
