(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var notifications = new NotificationsService(request.queryParams).getNotifications();

    return notifications;

})(request, response);
