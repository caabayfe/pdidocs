(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var restHandler, result, id, isSysId, snhelpUtil;

	try {
		snhelpUtil = new SNHelpUtil();
		if(!snhelpUtil.isSnHelpEnabled())
			return snhelpUtil.snHelpDisabledError(response);

		id = request.queryParams.sys_id || request.queryParams.resource_id;
		isSysId = request.queryParams.sys_id ? true : false;
		// Query params are stored in an array
		if(Array.isArray(id) && id.length > 0) {
			id = id[0];
		}

		restHandler = new SNHelpGuidanceRestHandler();

		result = restHandler.getResourceById(id, isSysId);
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
