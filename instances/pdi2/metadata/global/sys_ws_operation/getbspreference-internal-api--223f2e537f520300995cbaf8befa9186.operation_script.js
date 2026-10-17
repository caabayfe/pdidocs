(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	bsId (sys_id)
	prefName
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "getBSPreference");

})(request, response);
