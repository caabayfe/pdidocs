(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var setupPref = request.queryParams.setupPref,
		module = request.queryParams.module;
	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}

	var subscriptionService = actSubCtx.getSubscriptionService();

	var result = subscriptionService.getSubscribableObjects(setupPref, module);

	response.setStatus(result.status);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
