(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var table = request.body.data.table;
	var dashboard = new NotificationDashboard();
	response.setBody(dashboard.getTopNotificationsOfATable(table, request.body.data));

})(request, response);
