(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var actSubCtx = global.ActivitySubscriptionContext.getContext();
	if(!actSubCtx.isPluginEnabled()){
		response.setStatus(400);
		return {"status":400,
				"message":"Plugin is disabled please contact system administrator"};
	}
	//Fetch parameters
	var subObject = request.pathParams.sub_object;
	var subObjType = request.queryParams.objType;//orderBy, firstRow, lastRow
	var orderBy = request.queryParams.orderBy;
	var firstRow = request.queryParams.firstRow;
	var lastRow = request.queryParams.lastRow;	
	var searchString = request.queryParams.searchString;
	var fetchCount = request.queryParams.fetchCount;

	var subscriptionService = actSubCtx.getSubscriptionService();

	var result = subscriptionService.getSubscribersBySubscription(subObject, subObjType, orderBy, firstRow, lastRow, searchString, fetchCount);

	response.setStatus(result.status);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
