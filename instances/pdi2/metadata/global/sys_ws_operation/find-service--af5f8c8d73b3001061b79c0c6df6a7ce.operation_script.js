(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var result = {};
	response.setContentType('application/json');

	try {
		var error = 'Unknown error';
		response.setStatus(200);
		response.setBody(result);
		
		var params = request.queryParams;
		
		if(JSUtil.nil(params.name) && JSUtil.nil(params.number)) {
			error = 'Either name or number must be specified';
			response.setError(throwError(400, error));
			return;
		}
		
		result.services = searchServices(params.name, params.number);
		return;

	} catch(err) {
		response.setError(throwError(500, err));
		return;
	}
	
	
	function searchServices(name, number) {
		var services = [];
		var gr = new GlideRecord('cmdb_ci_service_auto');
		if(JSUtil.notNil(name))
			gr.addQuery('name', name);
		if(JSUtil.notNil(number))
			gr.addQuery('number', number);
		gr.query();
		
		if(gr.getRowCount() == 0) {
			return services;
		}
		
		while(gr.next()) {
			var serviceDetails = new CSDMAppServiceHelper().getApplicationService(gr.getValue('sys_id')).service_details;
			var service = {};
			service.name = serviceDetails.basic_details.name;
			service.number = serviceDetails.basic_details.number;
			service.sys_id = serviceDetails.basic_details.service_id;
			service.environment = serviceDetails.basic_details.environment;
			service.version = serviceDetails.basic_details.version;
			service.relationships = serviceDetails.relationships;
			services.push(service);
		}
		
		return services;
	}
	
	function throwError(status, errMsg) {
		var genericError = new sn_ws_err.ServiceError();
		genericError.setStatus(status);
		genericError.setMessage("Problem processing request");
		genericError.setDetail(errMsg);
		return genericError;
	}
})(request, response);
