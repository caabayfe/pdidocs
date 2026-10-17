(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var notificationDashboard = new NotificationDashboard();
    response.setBody(notificationDashboard.getTopNotifications(request.body.data));
})(request, response);
