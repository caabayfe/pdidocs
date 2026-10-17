(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var lazyLoadEnable = gs.getProperty('glide.email.dashboard.recipient_and_notification_table.lazy_load', "true");
    var notificationDashboard = new NotificationDashboard();
    if (lazyLoadEnable == "true") {
		response.setBody(notificationDashboard.getTopRecipients(request.body.data));
    } else {
        response.setBody(notificationDashboard.getTopRecipientAndNotifications(request.body.data));
    }
})(request, response);
