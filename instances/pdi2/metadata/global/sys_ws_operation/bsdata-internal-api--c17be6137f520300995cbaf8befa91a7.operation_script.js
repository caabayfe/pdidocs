(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	bsId (sys_id)
	historyTimestamp (optional number ms)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "bsData");

})(request, response);
