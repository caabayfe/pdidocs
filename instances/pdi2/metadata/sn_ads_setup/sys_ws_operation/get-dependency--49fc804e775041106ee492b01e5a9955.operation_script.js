(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var restHandler, result, stepId, dependencyId;
	try {
		restHandler = new sn_ads_setup.SNHelpSetupRestHandler();
		stepId = request.pathParams.step_id;
		dependencyId = request.pathParams.dependency_id;
		result = restHandler.getStepDependency(dependencyId, stepId);
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
