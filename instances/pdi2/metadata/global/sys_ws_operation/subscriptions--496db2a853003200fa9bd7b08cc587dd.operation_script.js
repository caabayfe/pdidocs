(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestData = request.body.data;
	var sub_obj_type_id = requestData.type;
	var sub_obj_id = request.pathParams.sub_obj_Id;	
	
	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}
	
	var subscriptionService = actSubCtx.getSubscriptionService();
	var result = subscriptionService.subscribe(sub_obj_type_id,sub_obj_id);
	response.setStatus(result.status);
	response.setBody(result);

})(request, response);
