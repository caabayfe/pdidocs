(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "getServiceTimelineCheckpoints");

})(request, response);
