(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var actSubCtx = global.ActivitySubscriptionContext.getContext();
	//is Activity Subscription plugin installed
	if (!actSubCtx.isPluginEnabled()) {
		response.setStatus(400);
		return {
			"status": 400,
			"message": gs.getMessage("Plugin is disabled, please contact system administrator")
		};
	}
	//fetch parameters
	var actContext = request.pathParams.activity_context;
	var sysId = request.pathParams.context_instance;
	var actFacetService = actSubCtx.getService(ActivityConstants.ACTIVITY_FACET_SERVCE);
	var additionalParams = {
		'startDate': request.queryParams.start_date,
		'endDate': request.queryParams.end_date,
		'facetIds': request.queryParams.facets,
		'lazyLoad': request.queryParams.lazy_load,
		'getActCount': request.queryParams.get_activity_count
	};
	var result = actFacetService.getFacetsInfo(actContext, sysId, additionalParams);

	response.setStatus(result.status);
	response.setContentType('application/json');
	response.setBody(result);

})(request, response);
