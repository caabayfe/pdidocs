(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var restHandler, result;
	try {
		restHandler = new sn_ads_setup.SNHelpSetupRestHandler();
		result = restHandler.selectGuidance(request.pathParams.sys_id);
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
