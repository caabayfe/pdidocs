(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Parameters:
	bsId (sys_id)
	ciId (sys_id)
	stableId (stable id of CI)
	from (number, ms)
	to (number, ms)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "compareCiFullData");

})(request, response);
