(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var actSubCtx = ActivitySubscriptionContext.getContext();
	if (!actSubCtx.isPluginEnabled()) {
		response.setStatus(400);
		return {
			"status": 400,
			"message": "Plugin is disabled please contact system administrator"
		};
	}

	var reqObject = {};
	reqObject.activityModule = request.queryParams.activity_module || null;
	reqObject.tableName = request.queryParams.name || null;

	var acService = actSubCtx.getService(ActivityConstants.ACTIVITY_CONTEXT_SERVICE);
	var contexts = acService.getActivityContexts(reqObject);

	response.setContentType('application/json');
	response.setStatus(contexts.status);

	if (contexts.status == 200)
		response.setBody(contexts.data);
	else
		response.setBody(contexts);

})(request, response);
