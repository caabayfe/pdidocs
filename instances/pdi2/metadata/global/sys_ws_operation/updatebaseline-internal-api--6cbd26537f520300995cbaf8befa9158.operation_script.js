(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	baselineId (sys_id)
	baselineName
	baselineComment
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "updateBaseline");

})(request, response);
