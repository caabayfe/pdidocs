(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
  var profileId = request.pathParams.profileId;	
  var streamName = request.queryParams.stream_name;
	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}

	var subscriptionService = actSubCtx.getSubscriptionService();

	var result = subscriptionService.getUserStream(profileId, streamName);

	response.setStatus(result.status);
	response.setContentType('application/json');
	response.setBody(result);
})(request, response);
