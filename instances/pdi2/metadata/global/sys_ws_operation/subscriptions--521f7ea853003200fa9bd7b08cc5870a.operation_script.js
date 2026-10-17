(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sub_obj_id = request.pathParams.sub_obj_id;	
	
	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}
	
	var subscriptionService = actSubCtx.getSubscriptionService();

	var result = subscriptionService.isSubscribed(sub_obj_id);
	
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
