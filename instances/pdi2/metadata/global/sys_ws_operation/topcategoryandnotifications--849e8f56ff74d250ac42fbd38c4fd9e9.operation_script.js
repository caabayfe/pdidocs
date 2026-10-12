(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var notificationDashboard = new NotificationDashboard();
        response.setBody(notificationDashboard.getTopCategory(request.body.data));

})(request, response);
