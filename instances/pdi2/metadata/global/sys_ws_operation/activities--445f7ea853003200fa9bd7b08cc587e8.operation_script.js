(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var actSubCtx = ActivitySubscriptionContext.getContext();
    if (!actSubCtx.isPluginEnabled()) {
        response.setStatus(400);
        return {
            "status": 400,
            "message": "Plugin is disabled please contact system administrator"
        };
    }

    var reqObject = {};
    reqObject.activity_count = request.queryParams.activity_count || gs.getProperty('com.snc.actsub.activities.api.fetch.limit');
    reqObject.stream = request.queryParams.stream;
    reqObject.profileId = request.queryParams.profile_id;
    reqObject.stFrom = request.queryParams.stFrom;
    reqObject.last = request.queryParams.last;
    reqObject.before = request.queryParams.before;
    reqObject.actor = request.queryParams.actor;
    reqObject.enableAggregation = request.queryParams.enableAggregation + "" == "true";
    reqObject.isFirstLoad = request.queryParams.isFirstLoad + "" == "true";
    reqObject.contextId = request.queryParams.context;
    reqObject.contextInstanceId = request.queryParams.context_instance;
    reqObject.facetIds = request.queryParams.facets;
    reqObject.recordId = request.queryParams.record_id;
    reqObject.startDate = request.queryParams.start_date;
    reqObject.endDate = request.queryParams.end_date;
	  reqObject.searchText = request.queryParams.search_text;
    reqObject.activityCreatedDate = request.queryParams.activity_created_date ? request.queryParams.activity_created_date : false;
    var activityService = actSubCtx.getActivityService();
    var activities = activityService.getActivitiesData(reqObject);

    response.setContentType('application/json');
    response.setStatus(activities.status);
    if (activities.status == 200)
        response.setBody(activities.data);
    else
        response.setBody(activities);

})(request, response);
