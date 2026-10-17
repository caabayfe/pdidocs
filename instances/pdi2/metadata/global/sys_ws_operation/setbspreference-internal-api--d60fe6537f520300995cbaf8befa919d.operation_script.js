(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	bsId (sys_id)
	prefName
	prefValue
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "setBSPreference");

})(request, response);
