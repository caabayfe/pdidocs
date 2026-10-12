(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var profileId = request.pathParams.profileId;
	var subObject = request.queryParams.subObject;

	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}
	var subscriptionService = actSubCtx.getSubscriptionService();

	var preferences = subscriptionService.getPreferences(profileId, subObject);
	response.setContentType('application/json');
	response.setStatus(preferences.status);
	response.setBody(preferences);
})(request, response);
