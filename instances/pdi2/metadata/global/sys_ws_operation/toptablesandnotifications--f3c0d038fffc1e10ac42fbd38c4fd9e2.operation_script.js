(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var lazyLoadEnable = gs.getProperty('glide.email.dashboard.table_and_notification_table.lazy_load', "true");
    var notificationDashboard = new NotificationDashboard();
    if (lazyLoadEnable == "true") {
        response.setBody(notificationDashboard.getTopTables(request.body.data));
    } else {
        response.setBody(notificationDashboard.getTopTablesAndNotifications(request.body.data));
    }

})(request, response);
