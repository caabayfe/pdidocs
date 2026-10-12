(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Parameters:
	serviceId (sys_id)
	from (number, ms)
	to (number, ms)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "compareService");

})(request, response);
