(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var dashboard = new NotificationDashboard();
    var result = dashboard.fetchUnusedNotificationsCount(request.body.data);
    response.setBody({
        count: result
    });

})(request, response);
