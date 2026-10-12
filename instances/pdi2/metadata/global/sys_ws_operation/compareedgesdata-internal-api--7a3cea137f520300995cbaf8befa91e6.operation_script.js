(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Parameters:
	bsId (sys_id)
	edgesIds (sys_ids of all edges to process)
	stableIds (stable ids of edges, sorted exactly as in edgesIds)
	from (number, ms)
	to (number, ms)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "compareEdgesData", true);

})(request, response);
