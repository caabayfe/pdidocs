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
		
		if(payload.hasOwnProperty('population_method')) {
			var population = [payload.population_method];
			if(!GlidePluginManager.isActive('com.snc.service-mapping') && (population[0].type === 'tag_list' || population[0].type === 'tag_based_service_family' || population[0].type === 'discovery') ) {
				error.message = "Provided population method need 'Service Mapping' plugin to be installed";
				response.setError(throwError(500, error));
				return;
			}
			var isValid = helper.validateBuildMethods(service_sys_id, population);
			if(!isValid) {
				error.message = 'Provided population method is not valid for given service';
				response.setError(throwError(400, error));
				return;
			}
			
			if(population[0].type === 'discovery') {
				helper.createApplicationService({"basic_details":{"service_id":service_sys_id}, "build_methods": population});
				return;
			}
			
			helper.updateBuildMethod(service_sys_id, population);
		}
		
	} catch(err) {
		response.setError(throwError(500, err.getMessage()));
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
