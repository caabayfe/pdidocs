(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	response.setBody({notificationGuid: gs.generateGUID()});

})(request, response);
