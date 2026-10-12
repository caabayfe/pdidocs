(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var actSubCtx = ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}

	var subscriptionService = actSubCtx.getSubscriptionService();
	var subscriber_id = request.pathParams.subscriber_id;
	var subObjType = request.queryParams.objType;
	var getList = request.queryParams.getList;
	var orderBy = request.queryParams.orderBy;
	var firstRow = request.queryParams.firstRow;
	var lastRow = request.queryParams.lastRow;	
	var searchString = request.queryParams.searchString;
	var subObjIds = request.queryParams.subObjIds;
	var result;
	if(!gs.nil(subObjIds)){
		result = subscriptionService.getSubscriptionStatusForSubObjects(subObjIds[0], subObjType);
	}
	else{
		result = subscriptionService.getSubscriptionsBySubscriber(subscriber_id, subObjType, getList, orderBy, firstRow, lastRow, searchString);
	}

	response.setStatus(result.status);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
