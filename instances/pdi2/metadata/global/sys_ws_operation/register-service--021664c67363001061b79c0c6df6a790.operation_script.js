(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {};
	response.setContentType('application/json');
	
	try {
		var service_sys_id = '';
		var error = {'message':'Unknown error'};
		var payload = request.body.data;
		
		if(!isRequestPayloadValid(payload, error)) {
			response.setError(throwError(400, error));
			return;
		}
		
		var helper = new CSDMAppServiceHelper();
		
		if(payload.hasOwnProperty('basic_details')) {
			//TODO: Rectify error message for uniqeness and mandatory attributes
			service_sys_id = helper.createApplicationService(payload);
			if(JSUtil.nil(service_sys_id)) {
				error.message = 'Could not create Application Service based on given inputs';
				response.setError(throwError(400, error));
				return;
			}
			result.service_sys_id = service_sys_id;
			var gr = new GlideRecord('cmdb_ci_service_auto');
			if(gr.get(service_sys_id))
				result.number = gr.getValue('number');
		}
		
		if(payload.hasOwnProperty('relationships') ) {
			helper.createCSDMRelationships(service_sys_id, payload.relationships);
			//TODO: add new rel_sys_ids to the result
		}
			
		response.setStatus(200);
		response.setBody(result);
		
	} catch(err) {
		response.setError(throwError(500, error));
		return;
	}
	
	
	// Supporting functions
	function isRequestPayloadValid(payload, errorMsg) {
		if(payload.hasOwnProperty('basic_details') || payload.hasOwnProperty('relationships')) {
			
			var basic = payload.basic_details;
			if(JSUtil.notNil(basic)) {
				if(basic.hasOwnProperty('sys_id') || basic.hasOwnProperty('sys_class_name') || basic.hasOwnProperty('sys_class_path')) { // TODO: Accomodate all sys fields
					errorMsg.message = "Updating system fields is not allowed";
					return false;
				}
			}
			var rels = payload.relationships;
			if(JSUtil.notNil(rels)) {
				if(!rels.hasOwnProperty('business_app') && !rels.hasOwnProperty('business_service_offering') && !rels.hasOwnProperty('technical_service_offering')) {
					errorMsg.message = "Relationships are not specified correctly";
					return false;
				}
			}
			return true;
		}
		errorMsg.message = "Request payload is not in expected format";
		return false;
	}
	
	function throwError(status, errMsg) {
		var genericError = new sn_ws_err.ServiceError();
		genericError.setStatus(status);
		genericError.setMessage("Problem processing request");
		genericError.setDetail(errMsg.message);
		return genericError;
	}
	
})(request, response);
