(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var restHandler, result, snhelpUtil;
	try {

		snhelpUtil = new SNHelpUtil();
		if(!snhelpUtil.isSnHelpEnabled())
			return snhelpUtil.snHelpDisabledError(response);

		restHandler = new SNHelpGuidanceRestHandler();
		result = restHandler.getDocumentById(request.pathParams.sys_id);
		response.setStatus(result.status);

		if (result.error) {
			response.setBody({error: result.error});
		} else {
			response.setStatus(result.status);
			response.setBody(result.data);
		}

	} catch (e) {
		response.setStatus(500);
		gs.error("SNHelpGuidanceRestHandler: " + e.message);
		response.setBody({error: "Internal server error"});
	}

})(request, response);
