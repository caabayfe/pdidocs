(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var restHandler, result, interactionId;
	try {
		restHandler = new sn_ads_setup.SNHelpSetupRestHandler();
		
		// Query Params could be array
		if(Array.isArray(request.queryParams.interaction_id)) 
			interactionId = request.queryParams.interaction_id[0];
		else
			interactionId = request.queryParams.interaction_id;
		
		result = restHandler.getStepTaskDetails(request.pathParams.task_id, interactionId);
		
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
