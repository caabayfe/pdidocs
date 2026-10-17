(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var dashboardUtils = new NotificationDashboardUtils();
    var result = dashboardUtils.getOptedOutInfoByNotificationID(request.body.data);
    response.setBody(result);
})(request, response);
