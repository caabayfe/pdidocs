(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	// implement resource here
	var requestData = request.body.data;	
	var profileId = request.pathParams.profileId;	
	var streamName = requestData.stream_name;
	var fanoutToStream = requestData.fanout;	
	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}

	var subscriptionService = actSubCtx.getSubscriptionService();

	var result = subscriptionService.updateUserStream(profileId, streamName, fanoutToStream);

	response.setStatus(result.status);
	response.setContentType('application/json');
	response.setBody(result);
})(request, response);
