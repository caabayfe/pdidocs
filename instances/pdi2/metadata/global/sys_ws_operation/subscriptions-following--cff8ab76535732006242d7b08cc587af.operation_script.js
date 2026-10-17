(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	// implement resource here
	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}

	var subscriptionService = actSubCtx.getSubscriptionService();
	var subscriber_id = request.pathParams.follower;
	var subObjType = request.queryParams.objType;
	var orderBy = request.queryParams.orderBy;
	var firstRow = request.queryParams.firstRow;
	var lastRow = request.queryParams.lastRow;	
	var searchString = request.queryParams.searchString;	

	var result = subscriptionService.getFollowingsByFollower(subscriber_id, subObjType, orderBy, firstRow, lastRow, searchString);

	response.setStatus(result.status);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
