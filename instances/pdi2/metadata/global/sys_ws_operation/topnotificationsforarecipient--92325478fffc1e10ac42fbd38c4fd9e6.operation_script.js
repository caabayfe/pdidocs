(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var user = request.body.data.user;
	var dashboard = new NotificationDashboard();
	response.setBody(dashboard.getTopNotificationsForARecipient(user, request.body.data));

})(request, response);
