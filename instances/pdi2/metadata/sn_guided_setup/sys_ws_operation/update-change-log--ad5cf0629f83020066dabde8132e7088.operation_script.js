(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var util = new GuidedSetupUtilSNC();
	var requestData = request.body.data;
	var contentId = requestData.contentId;
	var action = requestData.action;

	try {
		if (util.restSecurityWrapper(util.isMetaAccessAllowed(contentId))) {
			return util.updateChangeLog(contentId, action);
		}
	} catch (e) {
		return util.restErrorHandler(e, response);
	}

})(request, response);
