(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var restHandler, result, url, routeObj, snhelpUtil;
	try {
		snhelpUtil = new SNHelpUtil();
		if(!snhelpUtil.isSnHelpEnabled())
			return snhelpUtil.snHelpDisabledError(response);

		url = request.body.data.url;
		routeObj = request.body.data.route;
		includeAppshellTours = request.body.data.includeAppshellTours;

		restHandler = new SNHelpGuidanceRestHandler();
		result = restHandler.searchDocumentsAndTours(url, routeObj, includeAppshellTours);
		response.setStatus(result.status);
		if (result.error) {
			response.setBody({error: result.error});
		} else {
			response.setBody(result.data);
		}

	} catch (e) {
		response.setStatus(500);
		gs.error("SNHelpGuidanceRestHandler: " + e.message);
		response.setBody({error: "Internal server error"});
	}

})(request, response);
