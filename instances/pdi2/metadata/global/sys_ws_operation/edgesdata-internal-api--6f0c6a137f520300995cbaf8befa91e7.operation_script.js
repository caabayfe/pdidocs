(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
/**
Params:
	edgesIds
	stableIds
	historyTimestamp (number ms) - optional when getting historical view.
	bsId (sys_id)
*/
    var saOpsWrapper = new SaOperationsWrapper(SNC.SaActionsHandler);
	saOpsWrapper.process(request,response, "edgesData", true);

})(request, response);
