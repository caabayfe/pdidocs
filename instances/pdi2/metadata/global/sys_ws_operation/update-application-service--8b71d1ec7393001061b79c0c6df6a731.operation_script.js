(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	response.setContentType('application/json');
	var result = {};
	var helper = new CSDMAppServiceHelper();
	var requestBody = request.body;
	var requestData = requestBody.data; 
	var serviceUpdateError;
	
    // validate request payload
	if(JSUtil.nil(requestData.service_details.basic_details.service_id)) {
		var missingDetailsError = new sn_ws_err.ServiceError();
		missingDetailsError.setStatus(500);
		missingDetailsError.setMessage("Failed to update service");
		missingDetailsError.setDetail("Missing serviceId");
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
	
	var serviceId = requestData.service_details.basic_details.service_id;
	
	// validate that build method for given Application Service
	if(JSUtil.notNil(requestData.service_details.build_methods)) {
		var isBMValid = helper.validateBuildMethods(serviceId, requestData.service_details.build_methods);
		if(!isBMValid) {
			var invalidBMError = new sn_ws_err.ServiceError();
			invalidBMError.setStatus(500);
			invalidBMError.setMessage("Failed to update service");
			invalidBMError.setDetail("Supplied build method(s) is no valid for given service");
			response.setError(invalidBMError);
			return;
		}
	}
	
	if (requestData.service_details.removed_entry_points.length > 0 || (requestData.service_details.build_methods && (requestData.service_details.build_methods.length > 1 || requestData.service_details.build_methods[0].type == 'discovery' || requestData.service_details.build_methods[0].type == 'manual'))) {
		
		var id = helper.createApplicationService(requestData.service_details);
		if (!id) {
			var error = new sn_ws_err.ServiceError();
			error.setStatus(500);
			error.setMessage(gs.getMessage("Failed to update service"));
			response.setError(error);
			return;
		}
		
		if(JSUtil.notNil(requestData.service_details.relationships)) {
			helper.updateCSDMRel(serviceId, requestData.service_details.relationships);
		}
		
		if (!JSUtil.nil(requestData.service_details.info_request_data)) {
		    result.info_request_id = helper.createAppServiceInfoRequest(requestData.service_details.info_request_data.assigned_to, serviceId, requestData.service_details.info_request_data.details);
		}

		result.success = true;
		response.setStatus(200);
		response.setBody(result);
		return;
	}
	
	// update Application Service details
	var updated = helper.updateService('', serviceId, requestData.service_details.basic_details);
	if(updated !== serviceId) {
		serviceUpdateError = new sn_ws_err.ServiceError();
		serviceUpdateError.setStatus(500);
		serviceUpdateError.setMessage("Failed to update service");
		serviceUpdateError.setDetail("Basic_details in payload might have some problem");
		response.setError(serviceUpdateError);
		return;
	}
	
	// create relations as specified in payload and purge relations which are not specified in payload to enforce to CSDM relation structure
	
	if(JSUtil.notNil(requestData.service_details.relationships)) {
		helper.updateCSDMRel(serviceId, requestData.service_details.relationships);
	}
	
	if (!JSUtil.nil(requestData.service_details.info_request_data)) {
		result.info_request_id = helper.createAppServiceInfoRequest(requestData.service_details.info_request_data.assigned_to, serviceId, requestData.service_details.info_request_data.details);
	}

	// handle updates on build out methods
	if(JSUtil.notNil(requestData.service_details.build_methods)) {
		var status = helper.updateBuildMethod(serviceId, requestData.service_details.build_methods);
		if (status && status.error && status.statusCode) {
			serviceUpdateError = new sn_ws_err.ServiceError();
			serviceUpdateError.setStatus(status.statusCode);
			serviceUpdateError.setMessage(gs.getMessage("Failed to update service"));
			serviceUpdateError.setDetail(status.error);
			response.setError(serviceUpdateError);
			return;
		}
	}
	
	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
