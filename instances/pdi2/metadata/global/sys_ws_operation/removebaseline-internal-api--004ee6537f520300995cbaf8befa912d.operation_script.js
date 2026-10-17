(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Parameters:
	baselineId (sys_id)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "removeBaseline");

})(request, response);
