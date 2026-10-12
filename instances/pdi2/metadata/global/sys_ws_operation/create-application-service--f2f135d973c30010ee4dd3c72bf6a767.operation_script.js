(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	response.setContentType('application/json');
	var result = {};
	var helper = new CSDMAppServiceHelper();
	var requestBody = request.body;
	var requestData = requestBody.data; 
	
	var serviceId = '';
	
	if(JSUtil.nil(requestData.service_details.basic_details)) {
		var missingDetailsError = new sn_ws_err.ServiceError();
		missingDetailsError.setStatus(500);
		missingDetailsError.setMessage("Failed to create service");
		missingDetailsError.setDetail("Can not create service without enough details.");
		response.setError(missingDetailsError);
		return;
	}
		
	var validationResult = '';
	validationResult = helper.alreadyExists(requestData.service_details.basic_details);

	if(JSUtil.notNil(validationResult)) {
		var validationError = new sn_ws_err.ServiceError();
		validationError.already_exists = true;
		validationError.setStatus(400);
		validationError.setMessage(validationResult.error);
		validationError.setDetail("Validation failed");
		response.setError(validationError);
		return;
	}

	serviceId = helper.createApplicationService(requestData.service_details);
	
	if(JSUtil.nil(serviceId) || serviceId.error) {
		var serviceCreationError = new sn_ws_err.ServiceError();
		serviceCreationError.setStatus(JSUtil.notNil(serviceId.statusCode) ? serviceId.statusCode : 500);
		serviceCreationError.setMessage("Failed to create service");
		if (JSUtil.notNil(serviceId.error)) {
			serviceCreationError.setMessage(serviceId.error);
			serviceCreationError.setDetail("Validation failed");
		}

		response.setError(serviceCreationError);
		return;
	}
		
	requestData.service_details.sys_id = serviceId;
	
	helper.createCSDMRelationships(serviceId, requestData.service_details.relationships);
	if(!JSUtil.nil(requestData.service_details.info_request_data)){
		result.info_request_id = helper.createAppServiceInfoRequest(requestData.service_details.info_request_data.assigned_to, serviceId, requestData.service_details.info_request_data.details);
	}
	result.service_id = serviceId;
	
	response.setStatus(200);
	response.setBody(result);

})(request, response);
