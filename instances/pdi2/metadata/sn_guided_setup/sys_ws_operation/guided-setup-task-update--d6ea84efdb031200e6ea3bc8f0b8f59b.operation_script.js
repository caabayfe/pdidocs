(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new GuidedSetupUtilSNC();
	var requestData = request.body.data;
	var contentId = requestData.contentId;
	var setAllChildren = requestData.setAllChildren;
	var user = requestData.user;
	var contentUrl = requestData.contentUrl;

	try {
		if (util.restSecurityWrapper(util.isMetaAccessAllowed(contentId))) {
			if (setAllChildren)
				return util.setAllAssignee(contentId, user, contentUrl);
			else
				return util.newAssigneeUpdate(contentId, user, contentUrl);
		}
	} catch (e) {
		return util.restErrorHandler(e, response);
	}
})(request, response);
