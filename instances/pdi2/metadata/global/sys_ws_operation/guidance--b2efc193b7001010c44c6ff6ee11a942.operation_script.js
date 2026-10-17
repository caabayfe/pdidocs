(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var pathParams, gid, restHandler, result, snhelpUtil;
	pathParams = request.pathParams;
	gid = pathParams.guidance_id;

	try {
		snhelpUtil = new SNHelpUtil();
		if(!snhelpUtil.isSnHelpEnabled())
			return snhelpUtil.snHelpDisabledError(response);

		restHandler = new SNHelpGuidanceRestHandler();
		result = restHandler.getGuidance(gid);

		if(result.error) {
			response.setStatus(result.status);
			gs.error("SNHelpGuidanceRestController: Guidance {0} {1}", result.error, gid);
		}

		response.setBody(result);

	} catch(e) {

		response.setStatus(500);
		gs.error("SNHelpGuidanceRestController: Guidance - " + e.message);
		response.setBody({error: "Internal server error"});
	}



})(request, response);
