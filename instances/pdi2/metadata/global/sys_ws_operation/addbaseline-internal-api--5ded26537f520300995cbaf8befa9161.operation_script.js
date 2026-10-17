(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	bsId (sys_id)
	baselineName
	baselineComment (optional)
	timestamp (number ms)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "addBaseline");

})(request, response);
