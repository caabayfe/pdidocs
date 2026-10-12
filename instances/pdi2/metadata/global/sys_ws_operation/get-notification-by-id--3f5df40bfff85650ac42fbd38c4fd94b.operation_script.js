(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var dashboard = new NotificationDashboard();
    var result = dashboard.fetchNotificationRecordById(request.body.data);
    response.setBody(result);
})(request, response);
