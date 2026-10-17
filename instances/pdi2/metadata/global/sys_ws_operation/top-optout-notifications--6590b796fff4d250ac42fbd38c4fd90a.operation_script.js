(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var dashboard = new NotificationDashboard();
	var result = dashboard.getTopOptedOutNotifications(request.body.data);
	response.setBody(result);

})(request, response);
