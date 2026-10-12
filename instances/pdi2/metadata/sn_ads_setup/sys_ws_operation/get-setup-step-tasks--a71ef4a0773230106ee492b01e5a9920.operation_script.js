(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var restHandler, result, interactionId, task_type;
	try {
		restHandler = new sn_ads_setup.SNHelpSetupRestHandler();
		
		// Query Params could be array
		if(Array.isArray(request.queryParams.interaction_id)) 
			interactionId = request.queryParams.interaction_id[0];
		else
			interactionId = request.queryParams.interaction_id;
		
		if(Array.isArray(request.queryParams.task_type)) 
			task_type = request.queryParams.task_type[0];
		else
			task_type = request.queryParams.task_type;
		
		result = restHandler.getSetupStepTasks(request.pathParams.step_id, interactionId, task_type);
		
		response.setStatus(result.status);

		if (result.error) {
			response.setBody({error: result.error});
		} else {
			response.setBody(result.data);
		}

	} catch (e) {
		response.setStatus(500);
		gs.error("SNHelpSetupRestHandler: " + e.message);
		response.setBody({error: "Internal server error"});
	}

})(request, response);
