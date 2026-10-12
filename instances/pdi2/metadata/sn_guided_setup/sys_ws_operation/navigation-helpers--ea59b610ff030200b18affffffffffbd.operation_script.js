(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var util = new GuidedSetupUtilSNC();

	try {
		if (util.restSecurityWrapper(util.isMetaAccessAllowed())) {
			return util.processNavAction(request.pathParams.action, request.body.data, request.queryParams);
		}
	} catch (e) {
		return util.restErrorHandler(e, response);
	}

})(request, response);
