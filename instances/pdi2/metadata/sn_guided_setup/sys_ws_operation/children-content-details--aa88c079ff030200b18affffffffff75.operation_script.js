(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new GuidedSetupUtilSNC();

	try {
		if (util.restSecurityWrapper(util.isMetaReadAllowed())) {
			return util.getChildrenContentDetails(request.pathParams.contentTable, request.pathParams.parentId, request.queryParams);
		}
	} catch (e) {
		return util.restErrorHandler(e, response);
	}

})(request, response);
