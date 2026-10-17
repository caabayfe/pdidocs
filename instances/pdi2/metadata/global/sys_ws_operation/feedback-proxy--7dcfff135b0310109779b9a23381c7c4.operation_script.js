(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var controller = new SNHelpAnalyticsController();
    controller.logData(controller.CATEGORY, controller.POINT, controller.EVENTS.panel.feedback, request.body.data);

})(request, response);
