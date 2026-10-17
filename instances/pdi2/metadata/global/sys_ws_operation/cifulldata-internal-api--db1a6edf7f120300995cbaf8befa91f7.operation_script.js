(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	bsId (sys_id)
	ciId (sys_id)
	stableId (stable id of CI)
	historyTimestamp (optional, number ms)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "ciFullData");

})(request, response);
