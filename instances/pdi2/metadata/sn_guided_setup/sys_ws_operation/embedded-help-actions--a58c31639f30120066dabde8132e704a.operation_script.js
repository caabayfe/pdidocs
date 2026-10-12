(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var util = new GuidedSetupUtilSNC();
	var contentId = request.pathParams.content;
	var action = request.pathParams.action;

	// Added a role-based access check (isMetaAccessAllowed) before returning the
	// content, so only users with a role allowed on this content can access it.
	try {
		if (util.restSecurityWrapper(util.isMetaAccessAllowed(contentId))) {
			return util.embeddedHelpActions(contentId, action);
		}
	} catch (e) {
		return util.restErrorHandler(e, response);
	}

})(request, response);
