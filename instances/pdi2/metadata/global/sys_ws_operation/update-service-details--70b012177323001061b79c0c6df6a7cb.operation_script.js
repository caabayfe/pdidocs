(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {};
	response.setContentType('application/json');

	try {
		var service_sys_id = request.pathParams.service_sys_id;
		var error = {'message':'Unknown error'};
		var payload = request.body.data;
		response.setStatus(200);
		response.setBody(result);
		
		var helper = new CSDMAppServiceHelper();
		
		if(payload.hasOwnProperty('basic_details')) {
			var updated = helper.updateService('', service_sys_id, payload.basic_details);
			if(JSUtil.nil(updated) || updated !== service_sys_id) {
				error.message = 'Unable to update service';
				response.setError(throwError(400, error));
				return;
			}
		}
		
		if(payload.hasOwnProperty('relationships') ) {
			helper.updateCSDMRel(service_sys_id, payload.relationships);
		}
		
	} catch(err) {
		response.setError(throwError(500, error));
		return;
	}
	
	function throwError(status, errMsg) {
		var genericError = new sn_ws_err.ServiceError();
		genericError.setStatus(status);
		genericError.setMessage("Problem processing request");
		genericError.setDetail(errMsg.message);
		return genericError;
	}
	
})(request, response);
