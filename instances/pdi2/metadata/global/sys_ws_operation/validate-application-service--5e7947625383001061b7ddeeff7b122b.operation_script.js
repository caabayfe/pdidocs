(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = {};
	var helper = new CSDMAppServiceHelper();
	var requestBody = request.body;
	var requestData = requestBody.data;

	var validationResult = '';
	validationResult = helper.alreadyExists(requestData.basic_details);

	if(JSUtil.notNil(validationResult)) {
		response.setStatus(200);
		result.already_exists = true;
		result.service_id = validationResult.existingService;
		result.message = validationResult.error;
		response.setBody(result);
		return;
	}

	response.setStatus(200);
	result.already_exists = false;
	response.setBody(result);

})(request, response);
