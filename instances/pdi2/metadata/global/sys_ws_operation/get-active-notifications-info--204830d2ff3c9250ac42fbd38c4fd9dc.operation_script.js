(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
var dashboardUtils = new NotificationDashboardUtils();
var result = dashboardUtils.fetchNotificationsInfo(request.body.data);
response.setBody(result);

})(request, response);
