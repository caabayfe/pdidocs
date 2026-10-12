(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new GuidedSetupUtilSNC();

	try {
		// isMetaAccessAllowed security check is moved to script include
		return util.getRootContentDetails(request.pathParams.contentId, request.queryParams);
	} catch (e) {
		return util.restErrorHandler(e, response);
	}

})(request, response);
