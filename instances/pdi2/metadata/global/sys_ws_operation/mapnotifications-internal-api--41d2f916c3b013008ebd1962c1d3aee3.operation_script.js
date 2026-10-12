(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	/*
	 * params:
			 bsId - id of business service.
	   returns:
		  JSON encoding MapNotificationDTO, or
		  JSON encoding empty string: if no notifications on service.
	 */
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "getMapNotifications");

})(request, response);
